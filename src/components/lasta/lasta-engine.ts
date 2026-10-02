/* Banjalučka lasta – scroll-driven hero.
 * A skinned vector rig of the logo's diver, driven by the page scroll:
 * relaxed stance (with idle breathing) -> jump -> swallow dive -> exact logo pose,
 * then the circular emblem draws itself around him. Transparent, dependency-free. */

export type LastaLetter = { d: string; cx: number; cy: number };
export type LastaData = {
  v: number;
  blue: string;
  bones: string[];
  parent: number[];
  pivot: number[][];
  chan: string[];
  joints: { pos: number[][]; parent: number[] };
  shapes: { pts: number[]; base: number[]; inf: number[][] }[];
  channels: { dt: number; T: number; names: string[]; data: number[][] };
  final: string;
  emblem: { band: string; rIn: number; rOut: number; lw: number; top: LastaLetter[]; bottom: LastaLetter[] };
  ball: number[];
};

export type LastaOptions = {
  /** White inner fill of the emblem, like the printed logo. Default true. */
  fill?: boolean;
  /** Override the brand blue. */
  color?: string;
  /** Scroll progress (0–1) at which the diver lands in the logo pose. Default 0.86. */
  poseEnd?: number;
  /** Scroll progress at which the emblem draws in (hysteresis is built in). Default 0.83. */
  emblemAt?: number;
  /** Scroll smoothing: higher follows the scrollbar more tightly. Default 7. */
  smoothing?: number;
  /** Accessible name of the graphic. */
  label?: string;
};

export type LastaInstance = { destroy(): void; readonly progress: number };

const STYLE_ID = 'lasta-hero-style';
const CSS = `
.lasta-host{position:relative;--lasta-out:cubic-bezier(.23,1,.32,1);--lasta-io:cubic-bezier(.77,0,.175,1)}
.lasta-stage{position:sticky;top:0;height:100vh;height:100svh;display:grid;place-items:center;overflow:hidden;pointer-events:none}
.lasta-svg{display:block;width:min(84vmin,760px);height:auto;aspect-ratio:1/1;max-width:100%}
.lasta-ring,.lasta-sweep{fill:none;stroke-dasharray:var(--len) calc(var(--len) * 2);stroke-dashoffset:var(--len);
  transition:stroke-dashoffset .45s var(--lasta-out)}
.lasta-sweep{stroke:#fff}
.lasta-host[data-emblem="in"] .lasta-ring{stroke-dashoffset:0;transition:stroke-dashoffset 1.15s var(--lasta-io)}
.lasta-host[data-emblem="in"] .lasta-ring.o{transition-delay:.08s}
.lasta-host[data-emblem="in"] .lasta-sweep{stroke-dashoffset:calc(var(--len) * .44);transition:stroke-dashoffset 1s var(--lasta-out) .3s}
.lasta-disc{opacity:0;transform:scale(.965);transform-origin:500px 500px;transform-box:view-box;
  transition:opacity .4s var(--lasta-out),transform .45s var(--lasta-out)}
.lasta-host[data-emblem="in"] .lasta-disc{opacity:1;transform:none;transition:opacity .9s var(--lasta-out),transform 1.2s var(--lasta-out)}
.lasta-l{opacity:0;transform:translate(var(--dx),var(--dy));transform-box:view-box;
  transition:opacity .3s var(--lasta-out),transform .35s var(--lasta-out)}
.lasta-host[data-emblem="in"] .lasta-l{opacity:1;transform:none;
  transition:opacity .6s var(--lasta-out) calc(.55s + var(--i) * 60ms),transform .9s var(--lasta-out) calc(.55s + var(--i) * 60ms)}
.lasta-live,.lasta-final{transition:none}
@media (prefers-reduced-motion: reduce){
  .lasta-live,.lasta-final{transition:opacity .5s ease}
  .lasta-ring,.lasta-sweep{stroke-dashoffset:0!important;transition:none!important}
  .lasta-sweep{stroke-dashoffset:calc(var(--len) * .44)!important}
  .lasta-emblem{opacity:0;transition:opacity .6s ease}
  .lasta-host[data-emblem="in"] .lasta-emblem{opacity:1}
  .lasta-disc,.lasta-l,.lasta-host[data-emblem="in"] .lasta-disc,.lasta-host[data-emblem="in"] .lasta-l{opacity:1;transform:none;transition:none}
}`;

const SVGNS = 'http://www.w3.org/2000/svg';
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function injectStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const s = doc.createElement('style');
  s.id = STYLE_ID;
  s.textContent = CSS;
  doc.head.appendChild(s);
}

function emblemMarkup(data: LastaData, blue: string, fill: boolean, uid: string) {
  const e = data.emblem;
  const f = (n: number) => +n.toFixed(2);
  // half circle from just past the top (overlap hides the seam) down to just past the bottom
  const half = (r: number, sweep: 0 | 1) => {
    const e = 0.012, sgn = sweep ? -1 : 1;
    const x0 = 500 + sgn * r * Math.sin(e), y0 = 500 - r * Math.cos(e);
    const x1 = 500 + sgn * r * Math.sin(e), y1 = 500 + r * Math.cos(e);
    return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 1 ${sweep} ${f(x1)} ${f(y1)}`;
  };
  const rI = e.rIn + e.lw / 2;
  const rO = e.rOut - e.lw / 2;
  const rS = (e.rIn + e.rOut) / 2;
  const len = (r: number) => f((Math.PI + 0.024) * r);
  const ring = (r: number, cls: string) =>
    [1, 0]
      .map((s) => `<path class="lasta-ring ${cls}" d="${half(r, s as 0 | 1)}" stroke="${blue}" stroke-width="${e.lw}" style="--len:${len(r)}"/>`)
      .join('');
  const sweep = [1, 0]
    .map((s) => `<path class="lasta-sweep" d="${half(rS, s as 0 | 1)}" stroke-width="${f(e.rOut - e.rIn + 24)}" style="--len:${len(rS)}"/>`)
    .join('');
  const top = e.top.map((l) => l.d).join('');
  const bottom = e.bottom
    .map((l, i) => {
      const dx = 500 - l.cx, dy = 500 - l.cy, m = Math.hypot(dx, dy) || 1;
      return `<path class="lasta-l" d="${l.d}" fill="${blue}" fill-rule="evenodd" style="--i:${i};--dx:${f((dx / m) * 12)}px;--dy:${f((dy / m) * 12)}px"/>`;
    })
    .join('');
  return (
    `<defs><mask id="${uid}-sweep" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">${sweep}</mask></defs>` +
    `<g class="lasta-emblem">` +
    (fill ? `<circle class="lasta-disc" cx="500" cy="500" r="${e.rOut}" fill="#fff"/>` : '') +
    ring(rI, 'i') + ring(rO, 'o') +
    `<g mask="url(#${uid}-sweep)"><path d="${e.band}" fill="${blue}"/><path d="${top}" fill="#fff" fill-rule="evenodd"/></g>` +
    `<g>${bottom}</g></g>`
  );
}

/** Rig + skinning, pure math. */
function createRig(data: LastaData) {
  const DEG = Math.PI / 180, TAU = Math.PI * 2;
  const nb = data.bones.length;
  const names = data.channels.names;
  const ci: Record<string, number> = {};
  names.forEach((n, i) => (ci[n] = i));
  const boneChan = data.chan.map((c) => ci[c]);
  const M = new Float64Array(nb * 6);
  const A = new Float64Array(nb);
  const pose = new Float64Array(names.length);
  const jp = data.joints.pos, jpar = data.joints.parent;
  const JW = new Float64Array(jp.length * 2);
  const shapes = data.shapes.map((s) => ({
    pts: Float64Array.from(s.pts),
    base: Uint8Array.from(s.base),
    inf: s.inf,
    out: new Float64Array(s.pts.length),
  }));

  function sample(t: number) {
    const ch = data.channels, n = ch.data[0].length;
    let u = t / ch.dt;
    u = u < 0 ? 0 : u > n - 1 ? n - 1 : u;
    const i = Math.min(n - 2, Math.floor(u)), fr = u - i;
    for (let k = 0; k < names.length; k++) {
      const a = ch.data[k];
      pose[k] = a[i] + (a[i + 1] - a[i]) * fr;
    }
  }
  function solve() {
    for (let b = 0; b < nb; b++) {
      const th = pose[boneChan[b]] * DEG, c = Math.cos(th), s = Math.sin(th);
      const px = data.pivot[b][0], py = data.pivot[b][1];
      const le = px - c * px + s * py, lf = py - s * px - c * py;
      const p = data.parent[b], o = b * 6;
      if (p < 0) {
        M[o] = c; M[o + 1] = s; M[o + 2] = -s; M[o + 3] = c;
        M[o + 4] = le + pose[ci.dx]; M[o + 5] = lf + pose[ci.dy];
      } else {
        const q = p * 6, pa = M[q], pb = M[q + 1], pc = M[q + 2], pd = M[q + 3];
        M[o] = pa * c + pc * s; M[o + 1] = pb * c + pd * s;
        M[o + 2] = -pa * s + pc * c; M[o + 3] = -pb * s + pd * c;
        M[o + 4] = pa * le + pc * lf + M[q + 4]; M[o + 5] = pb * le + pd * lf + M[q + 5];
      }
      A[b] = Math.atan2(M[o + 1], M[o]);
    }
    for (let j = 0; j < jp.length; j++) {
      const q = jpar[j] * 6, x = jp[j][0], y = jp[j][1];
      JW[2 * j] = M[q] * x + M[q + 2] * y + M[q + 4];
      JW[2 * j + 1] = M[q + 1] * x + M[q + 3] * y + M[q + 5];
    }
  }
  function path(si: number) {
    const s = shapes[si], P = s.pts, O = s.out, B = s.base, n = B.length;
    for (let i = 0; i < n; i++) {
      const o = B[i] * 6, x = P[2 * i], y = P[2 * i + 1];
      O[2 * i] = M[o] * x + M[o + 2] * y + M[o + 4];
      O[2 * i + 1] = M[o + 1] * x + M[o + 3] * y + M[o + 5];
    }
    const inf = s.inf;
    for (let k = 0; k < inf.length; k++) {
      const r = inf[k], i = r[0], j = r[1];
      let da = A[r[2]] - A[B[i]];
      da = ((((da + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      const a = r[3] * da;
      if (a === 0) continue;
      const c = Math.cos(a), sn = Math.sin(a), jx = JW[2 * j], jy = JW[2 * j + 1];
      const rx = O[2 * i] - jx, ry = O[2 * i + 1] - jy;
      O[2 * i] = jx + c * rx - sn * ry;
      O[2 * i + 1] = jy + sn * rx + c * ry;
    }
    let d = 'M' + O[0].toFixed(1) + ' ' + O[1].toFixed(1);
    for (let i = 1; i < n; i++) d += 'L' + O[2 * i].toFixed(1) + ' ' + O[2 * i + 1].toFixed(1);
    return d + 'Z';
  }
  return { pose, ci, sample, solve, path, count: shapes.length, T: data.channels.T };
}

let uidCounter = 0;

export function mountLasta(host: HTMLElement, data: LastaData, options: LastaOptions = {}): LastaInstance {
  const doc = host.ownerDocument;
  const win = doc.defaultView || window;
  injectStyle(doc);
  const blue = options.color || data.blue;
  const poseEnd = options.poseEnd ?? 0.86;
  const emblemAt = options.emblemAt ?? 0.83;
  const rate = options.smoothing ?? 7;
  const uid = `lasta${++uidCounter}`;

  host.classList.add('lasta-host');
  const stage = doc.createElement('div');
  stage.className = 'lasta-stage';
  const svg = doc.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'lasta-svg');
  svg.setAttribute('viewBox', '0 0 1000 1000');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', options.label || 'Бањалучка ласта — удружење');
  svg.innerHTML =
    emblemMarkup(data, blue, options.fill !== false, uid) +
    `<g class="lasta-live" fill="${blue}"><path/><path/><path/></g>` +
    `<path class="lasta-final" d="${data.final}" fill="${blue}" fill-rule="evenodd" style="opacity:0"/>`;
  stage.appendChild(svg);
  host.appendChild(stage);

  const live = svg.querySelector('.lasta-live') as SVGGElement;
  const livePaths = Array.from(live.querySelectorAll('path'));
  const finalPath = svg.querySelector('.lasta-final') as SVGPathElement;
  const rig = createRig(data);
  const reduce = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null;

  let target = 0, current = 0, last = -1, raf = 0, prev = 0, visible = true, emblemIn = false, showingFinal = false;

  const read = () => {
    const r = host.getBoundingClientRect();
    const span = r.height - win.innerHeight;
    target = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  };

  const setFinal = (on: boolean) => {
    if (on === showingFinal) return;
    showingFinal = on;
    finalPath.style.opacity = on ? '1' : '0';
    live.style.opacity = on ? '0' : '1';
  };

  const draw = (p: number, now: number) => {
    const reduced = !!(reduce && reduce.matches);
    const T = rig.T;
    let t = T * Math.min(1, p / poseEnd);
    const idle = reduced ? 0 : 1 - smoothstep(0, 0.05, p);
    if (reduced) t = p < poseEnd * 0.5 ? 0 : T;
    const atEnd = t >= T - 1e-6;
    // emblem with hysteresis
    if (!emblemIn && p >= emblemAt) { emblemIn = true; host.dataset.emblem = 'in'; }
    else if (emblemIn && p < emblemAt - 0.03) { emblemIn = false; delete host.dataset.emblem; }
    if (atEnd && idle === 0) { setFinal(true); return; }
    setFinal(false);
    rig.sample(t);
    if (idle > 0) {
      const ph = (now / 4.6) * Math.PI * 2, P = rig.pose, ci = rig.ci;
      P[ci.s2] += -0.9 * Math.sin(ph) * idle;
      P[ci.neck] += 0.7 * Math.sin(ph + 0.6) * idle;
      P[ci.armL] += 0.4 * Math.sin(ph + 0.3) * idle;
      const sway = 0.28 * Math.sin((now / 7.3) * Math.PI * 2) * idle;
      live.setAttribute('transform', `rotate(${sway.toFixed(3)} ${data.ball[0].toFixed(1)} ${data.ball[1].toFixed(1)})`);
    } else if (live.hasAttribute('transform')) live.removeAttribute('transform');
    rig.solve();
    for (let s = 0; s < rig.count; s++) livePaths[s].setAttribute('d', rig.path(s));
  };

  const tick = (ts: number) => {
    raf = 0;
    const now = ts / 1000;
    const dt = prev ? Math.min(0.05, now - prev) : 0.016;
    prev = now;
    const reduced = !!(reduce && reduce.matches);
    current = reduced ? target : current + (target - current) * (1 - Math.exp(-dt * rate));
    if (Math.abs(target - current) < 1e-4) current = target;
    const idleActive = !reduced && current < 0.05;
    if (idleActive || Math.abs(current - last) > 1e-6) {
      draw(current, now);
      last = current;
    }
    if (visible && (idleActive || current !== target)) raf = win.requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf && visible) { prev = 0; raf = win.requestAnimationFrame(tick); }
  };
  const onScroll = () => { read(); kick(); };

  const io = 'IntersectionObserver' in win
    ? new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) kick(); })
    : null;
  io?.observe(host);
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', onScroll);
  reduce?.addEventListener?.('change', onScroll);
  read();
  current = target;
  draw(current, win.performance.now() / 1000);
  last = current;
  kick();

  return {
    get progress() { return current; },
    destroy() {
      if (raf) win.cancelAnimationFrame(raf);
      io?.disconnect();
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
      reduce?.removeEventListener?.('change', onScroll);
      stage.remove();
      host.classList.remove('lasta-host');
      delete host.dataset.emblem;
    },
  };
}
