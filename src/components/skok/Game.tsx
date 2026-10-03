'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { config, heightFor, windowFor } from '@/components/skok/config';
import { ANIM_T, LAUNCH_T, SOLE_BELOW_HIP, drawDiver, mixPose, poses, sample, swallowAt, turned, type Pose } from '@/components/skok/diver';

const C = config.colors;
const STEP = 1 / 120; // fixed physics step in seconds of real time
const STAND_HIP = SOLE_BELOW_HIP; // hip height above the platform deck when standing, in metres
const IMPACT_Y = 1.0; // the diver "reaches the water" when the hips are this high (hands/head touch first)
const EDGE_X = -0.25; // where the diver stands on the deck before the jump

type Phase = 'intro' | 'climb' | 'pose' | 'fall' | 'result' | 'over';
type Outcome = 'clean' | 'early' | 'late';
type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number };
type Ring = { x: number; age: number; size: number };
type Best = { score: number; level: number };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function readBest(): Best {
  try {
    const raw = window.localStorage.getItem(config.storageKey);
    if (raw) {
      const b = JSON.parse(raw) as Best;
      if (typeof b.score === 'number' && typeof b.level === 'number') return b;
    }
  } catch {
    // Private mode or blocked storage: play without a saved best.
  }
  return { score: 0, level: 0 };
}

function writeBest(best: Best) {
  try {
    window.localStorage.setItem(config.storageKey, JSON.stringify(best));
  } catch {
    // Same as above; the result just isn't remembered.
  }
}

/**
 * "Skok laste": a one-button timing game. The diver climbs the tower, takes the
 * swallow pose and jumps; the player taps once (or presses Space) to bring the
 * arms together over the head before the water. Too early and the diver loses
 * form and tumbles, too late and it is a flat slap. Every clean dive raises the
 * platform and shrinks the timing window (see config.ts).
 *
 * Everything moving lives in refs and is drawn on a canvas from one
 * requestAnimationFrame loop with a fixed 120 Hz step, so it plays at the same
 * speed on 60 Hz and 120 Hz screens. React state only holds what the overlays
 * show (phase, level, score, messages).
 */
export default function Game() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<Best>({ score: 0, level: 0 });
  const [message, setMessage] = useState<{ title: string; detail: string; good: boolean } | null>(null);
  const [reduce, setReduce] = useState(false);

  // The whole simulation, outside React.
  const sim = useRef({
    phase: 'intro' as Phase,
    level: 1,
    score: 0,
    t: 0, // ms since the current phase started (real time)
    clock: 0, // ms since the game mounted, for waves
    x: -1.9,
    y: 0,
    vx: 0,
    vy: 0,
    startY: 0,
    pose: poses.stance as Pose,
    tapAt: -1, // sim.t of the tap during the fall, -1 if none
    tapLeft: 0, // real-time ms that were left until the water when the tap came
    outcome: null as Outcome | null,
    spin: 0,
    impacted: false,
    cam: { x: 0.4, y: 6, view: config.viewMetres },
    drops: [] as Drop[],
    rings: [] as Ring[],
  });

  const pace = reduce ? 0.35 : 1;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    setBest(readBest());
    // No page scrolling or zooming underneath the game.
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, []);

  const go = useCallback((p: Phase) => {
    sim.current.phase = p;
    sim.current.t = 0;
    setPhase(p);
  }, []);

  /** Puts the diver at the foot of the tower for a level and starts the climb. */
  const startLevel = useCallback(
    (lvl: number) => {
      const s = sim.current;
      s.level = lvl;
      s.x = -1.9;
      s.y = 0.4;
      s.vx = 0;
      s.vy = 0;
      s.pose = poses.stance;
      s.tapAt = -1;
      s.outcome = null;
      s.spin = 0;
      s.impacted = false;
      setLevel(lvl);
      setMessage(null);
      go('climb');
    },
    [go],
  );

  const start = useCallback(() => {
    const s = sim.current;
    s.score = 0;
    s.drops = [];
    s.rings = [];
    setScore(0);
    startLevel(1);
  }, [startLevel]);

  /** Real-time milliseconds until the hips reach IMPACT_Y, from the current state. */
  const msToImpact = () => {
    const s = sim.current;
    const g = config.gravity;
    const d = s.y - IMPACT_Y;
    if (d <= 0) return 0;
    const t = (s.vy + Math.sqrt(s.vy * s.vy + 2 * g * d)) / g; // seconds of game time
    return (t / config.timeScale) * 1000;
  };

  const tap = useCallback(() => {
    const s = sim.current;
    if (s.phase !== 'fall' || s.tapAt >= 0) return;
    const left = msToImpact();
    const lead = config.closeMs;
    const w = windowFor(s.level);
    s.tapAt = s.t;
    if (left > lead + w) s.outcome = 'early';
    else if (left < lead) s.outcome = 'late';
    else s.outcome = 'clean';
    s.tapLeft = left;
  }, []);

  // Input: tap or click anywhere on the scene, Space on a keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (sim.current.phase === 'fall') {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tap]);

  // The loop.
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const splash = (x: number, big: boolean) => {
      const s = sim.current;
      const n = Math.round((big ? 46 : 14) * (reduce ? 0.5 : 1));
      for (let i = 0; i < n; i++) {
        const spread = big ? 4.5 : 1.4;
        s.drops.push({
          x: x + (Math.random() - 0.5) * (big ? 1.4 : 0.3),
          y: 0.05,
          vx: (Math.random() - 0.5) * spread,
          vy: (big ? 3 : 4.5) + Math.random() * (big ? 5 : 3),
          r: 0.04 + Math.random() * (big ? 0.12 : 0.06),
          life: 1,
        });
      }
      const rings = big ? 4 : 2;
      for (let i = 0; i < rings; i++) s.rings.push({ x, age: -i * 0.18, size: big ? 2.6 : 1.4 });
    };

    const step = (dt: number) => {
      const s = sim.current;
      const ms = dt * 1000;
      s.t += ms;
      s.clock += ms;
      const H = heightFor(s.level);
      const deckHip = H + STAND_HIP;

      if (s.phase === 'climb') {
        const dur = config.climbMs * pace;
        const p = clamp01(s.t / dur);
        // Up the ladder for the first 75%, then a few steps to the edge.
        const up = ease(clamp01(p / 0.75));
        s.y = 0.4 + (deckHip - 0.4) * up;
        const walk = ease(clamp01((p - 0.75) / 0.25));
        s.x = -1.9 + (EDGE_X + 1.9) * walk;
        // Hand over hand up the ladder, then a few steps to the edge.
        const cycle = (Math.sin(s.t / 110) + 1) / 2;
        s.pose = p < 0.75 ? mixPose(poses.climbA, poses.climbB, cycle) : poses.stance;
        if (p >= 1) go('pose');
      } else if (s.phase === 'pose') {
        const dur = config.poseMs * pace;
        const p = clamp01(s.t / dur);
        // His own take-off from the logo animation: stance, crouch with the arms swung back, launch.
        s.pose = sample(LAUNCH_T * ease(p));
        if (p >= 1) {
          s.vx = config.jumpForward;
          s.vy = config.jumpUp;
          s.startY = s.y;
          go('fall');
        }
      } else if (s.phase === 'fall') {
        // Real gravity, in game time.
        const gdt = dt * config.timeScale;
        s.vy -= config.gravity * gdt;
        s.x += s.vx * gdt;
        s.y += s.vy * gdt;

        // In the air he finishes the logo animation into the swallow (the logo pose), then holds
        // it, pitching only gently forward.
        const progress = clamp01((s.startY - s.y) / Math.max(1, s.startY - IMPACT_Y));
        const flying: Pose =
          progress < 0.35
            ? sample(LAUNCH_T + (ANIM_T - LAUNCH_T) * ease(progress / 0.35))
            : swallowAt(-12 + 22 * ((progress - 0.35) / 0.65));

        if (s.tapAt < 0) {
          s.pose = flying;
        } else {
          const c = clamp01((s.t - s.tapAt) / config.closeMs);
          s.pose = mixPose(flying, poses.entry, ease(c));
          if (s.outcome === 'early' && s.t - s.tapAt > config.closeMs + 140) {
            // Held the needle too long: form goes, and the body starts to tumble.
            s.spin += 420 * dt;
            const k = clamp01((s.t - s.tapAt - config.closeMs - 140) / 260);
            s.pose = turned(mixPose(poses.entry, poses.tumble, k), s.spin);
          }
        }

        if (s.y <= IMPACT_Y && !s.impacted) {
          s.impacted = true;
          const outcome: Outcome = s.outcome ?? 'late';
          s.outcome = outcome;
          if (outcome === 'clean') {
            const left = s.tapLeft;
            const win = windowFor(s.level);
            const centre = config.closeMs + win / 2;
            const quality = clamp01(1 - Math.abs(left - centre) / (win / 2));
            const bonus = Math.round(config.perfectBonus * quality);
            const points = config.cleanPoints + bonus;
            s.score += points;
            setScore(s.score);
            const perfect = quality >= 1 - config.perfectZone;
            setMessage({
              title: perfect ? 'Savršeno!' : 'Čist skok!',
              detail: `+${points} (bonus ${bonus})`,
              good: true,
            });
            splash(s.x, false);
          } else {
            setMessage({
              title: 'Pljas!',
              detail: outcome === 'early' ? 'Prerano: ruke zajedno predugo, skakač se prevrnuo.' : 'Prekasno: ruke su još raširene.',
              good: false,
            });
            splash(s.x, true);
            // Flat on the water, with a little bounce.
            s.vy = 1.8;
            s.vx = 0.2;
            s.y = 0.12;
            s.pose = poses.slap;
          }
          go('result');
        }
      } else if (s.phase === 'result') {
        const gdt = dt * config.timeScale;
        if (s.outcome === 'clean') {
          // Straight in, and gone under the surface.
          s.vy -= config.gravity * gdt * 0.3;
          s.y += s.vy * gdt;
          s.x += s.vx * gdt * 0.3;
        } else {
          // Bounce once, then bob on the surface, sorry for itself.
          s.vy -= config.gravity * gdt;
          s.y += s.vy * gdt;
          s.x += s.vx * gdt;
          if (s.y < 0.12) {
            s.y = 0.12;
            s.vy = 0;
            s.vx *= 0.9;
          }
          const bob = s.t > 500 ? Math.sin(s.t / 260) * 0.05 : 0;
          s.y += bob * dt * 10;
          // Rolls onto his back and lies there, one arm up, rocking with the water.
          const k = clamp01((s.t - 350) / 600);
          s.pose = turned(mixPose(poses.slap, poses.float, ease(k)), Math.sin(s.t / 300) * 4 * k);
        }
        if (s.t >= config.resultMs * pace) {
          if (s.outcome === 'clean') startLevel(s.level + 1);
          else {
            const b = readBest();
            if (s.score > b.score || (s.score === b.score && s.level > b.level)) {
              const nb = { score: s.score, level: s.level };
              writeBest(nb);
              setBest(nb);
            } else setBest(b);
            go('over');
          }
        }
      }

      // Splash drops and rings.
      for (const d of s.drops) {
        d.vy -= config.gravity * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.y < 0) d.life -= dt * 4;
      }
      s.drops = s.drops.filter((d) => d.life > 0);
      for (const r of s.rings) r.age += dt;
      s.rings = s.rings.filter((r) => r.age < 1.6);

      // Camera: follows the diver, never lets the water drop off the bottom of the screen,
      // and zooms out a little on higher levels.
      const view = Math.min(config.viewMaxMetres, config.viewMetres + (s.level - 1) * config.viewPerLevel);
      const minY = view / 2 - 1.8;
      const targetY = Math.max(minY, s.phase === 'intro' ? H * 0.55 : s.y - 0.8);
      const follow = reduce ? 1 : 1 - Math.exp(-dt * 6);
      s.cam.view += (view - s.cam.view) * follow;
      s.cam.y += (targetY - s.cam.y) * follow;
    };

    const draw = () => {
      const s = sim.current;
      const H = heightFor(s.level);
      const ppm = h / s.cam.view;
      const sx = (x: number) => w / 2 + (x - s.cam.x) * ppm;
      const sy = (y: number) => h / 2 - (y - s.cam.y) * ppm;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = C.sky;
      ctx.fillRect(0, 0, w, h);

      // Far hills, very faint, for depth.
      ctx.fillStyle = 'rgba(20, 32, 31, 0.06)';
      ctx.beginPath();
      ctx.moveTo(0, sy(0));
      for (let i = 0; i <= 24; i++) {
        const x = (i / 24) * w;
        ctx.lineTo(x, sy(0) - (2.4 + Math.sin(i * 0.9) * 0.9 + Math.sin(i * 0.37) * 1.2) * ppm);
      }
      ctx.lineTo(w, sy(0));
      ctx.fill();

      // The tower: a stone column with a ladder, and the deck on top.
      ctx.fillStyle = C.stone;
      ctx.fillRect(sx(-1.75), sy(H), 1.1 * ppm, H * ppm + 4);
      ctx.fillStyle = C.stoneDark;
      for (let y = 0.6; y < H; y += 0.45) ctx.fillRect(sx(-2.05), sy(y), 0.3 * ppm, Math.max(1, 0.04 * ppm));
      ctx.fillRect(sx(-2.05), sy(H), Math.max(1, 0.04 * ppm), H * ppm);
      ctx.fillRect(sx(-1.79), sy(H), Math.max(1, 0.04 * ppm), H * ppm);
      ctx.fillStyle = C.ink;
      ctx.fillRect(sx(-2.2), sy(H), 2.4 * ppm, 0.14 * ppm);
      // Height mark on the column.
      ctx.fillStyle = C.ink;
      ctx.font = `600 ${Math.max(11, 0.32 * ppm)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${H.toFixed(H % 1 ? 1 : 0)} m`, sx(-1.2), sy(H - 0.7));

      // The diver (before the water, so the water covers whatever has gone under).
      ctx.save();
      ctx.translate(sx(s.x), sy(s.y));
      ctx.scale(ppm, ppm);
      drawDiver(ctx, s.pose, C.ink);
      ctx.restore();

      // Water: a gently moving surface line and deep teal below.
      const t = s.clock / 1000;
      const surface = (x: number) => 0.05 * Math.sin(x * 1.3 + t * 1.5) + 0.03 * Math.sin(x * 2.7 - t * 1.1);
      ctx.fillStyle = C.water;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i <= 48; i++) {
        const px = (i / 48) * w;
        const wx = s.cam.x + (px - w / 2) / ppm;
        ctx.lineTo(px, sy(surface(wx)));
      }
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.strokeStyle = C.waterLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const px = (i / 48) * w;
        const wx = s.cam.x + (px - w / 2) / ppm;
        const py = sy(surface(wx));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // A floating diver lies on top of the water.
      if (s.phase === 'result' && s.outcome !== 'clean') {
        ctx.save();
        ctx.translate(sx(s.x), sy(s.y));
        ctx.scale(ppm, ppm);
        drawDiver(ctx, s.pose, C.ink);
        ctx.restore();
      }

      // Ripple rings and drops.
      for (const r of s.rings) {
        if (r.age < 0) continue;
        const k = r.age / 1.6;
        ctx.strokeStyle = `rgba(255,255,255,${(0.7 * (1 - k)).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(sx(r.x), sy(0), r.size * k * ppm, r.size * k * ppm * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = C.foam;
      for (const d of s.drops) {
        ctx.globalAlpha = Math.max(0, Math.min(1, d.life));
        ctx.beginPath();
        ctx.arc(sx(d.x), sy(d.y), Math.max(1.5, d.r * ppm), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        step(STEP);
        acc -= STEP;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [go, pace, reduce, startLevel]);

  const height = heightFor(level);

  return (
    <div
      id="main"
      className="fixed inset-0 touch-none select-none overflow-hidden overscroll-none"
      style={{ background: C.sky, color: C.ink, WebkitTouchCallout: 'none' }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        tap();
      }}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />

      {/* Top bar: back link, level, height, score. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:p-6">
        <Link
          href="/"
          className="pointer-events-auto rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: 'rgba(20,32,31,0.08)' }}
        >
          ← Nazad
        </Link>
        {phase !== 'intro' && (
          <dl className="flex gap-5 text-right text-sm font-semibold tabular-nums">
            <div>
              <dt className="text-xs font-medium opacity-60">Nivo</dt>
              <dd className="text-lg">{level}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium opacity-60">Visina</dt>
              <dd className="text-lg">{height % 1 ? height.toFixed(1) : height} m</dd>
            </div>
            <div>
              <dt className="text-xs font-medium opacity-60">Bodovi</dt>
              <dd className="text-lg">{score}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Result of the last dive. */}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center px-6 text-center">
        {message && phase === 'result' && (
          <div className="skok-pop">
            <p className="display text-[clamp(2.5rem,12vw,5rem)]" style={{ color: message.good ? C.ink : C.accent }}>
              {message.title}
            </p>
            <p className="mt-2 text-base font-semibold opacity-80">{message.detail}</p>
          </div>
        )}
      </div>

      {phase === 'fall' && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] text-center text-sm font-semibold opacity-60">
          Dodirni ekran ili pritisni razmak
        </p>
      )}

      {phase === 'intro' && (
        <Panel>
          <h1 className="display text-[clamp(2.5rem,11vw,4.5rem)]">Skok laste</h1>
          <p className="mt-4 max-w-[30ch] text-lg leading-snug">Pritisni u pravom trenutku: ruke zajedno iznad glave tik prije vode.</p>
          <ActionButton onClick={start} autoFocus>
            Skoči
          </ActionButton>
          {best.score > 0 && (
            <p className="mt-5 text-sm font-semibold opacity-70">
              Najbolji rezultat: {best.score} (nivo {best.level})
            </p>
          )}
        </Panel>
      )}

      {phase === 'over' && (
        <Panel>
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: C.accent }}>
            Kraj skoka
          </p>
          <h1 className="display mt-3 text-[clamp(2.25rem,10vw,4rem)]">Nivo {level}</h1>
          <p className="mt-3 text-lg">
            {heightFor(level)} m, {score} bodova
          </p>
          <p className="mt-1 text-sm font-semibold opacity-70">
            Najbolji rezultat: {best.score} (nivo {best.level})
          </p>
          <ActionButton onClick={start} autoFocus>
            Pokušaj ponovo
          </ActionButton>
        </Panel>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(243,244,241,0.82)' }}>
      <div className="flex max-w-md flex-col items-center text-center">{children}</div>
    </div>
  );
}

function ActionButton({ children, onClick, autoFocus }: { children: React.ReactNode; onClick: () => void; autoFocus?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className="mt-8 rounded-full px-8 py-4 text-lg font-bold text-white transition-transform duration-150 ease-[var(--ease-out-expo)] active:scale-[0.97] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4"
      style={{ background: config.colors.accent, outlineColor: config.colors.ink }}
    >
      {children}
    </button>
  );
}
