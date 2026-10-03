'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import BgVideo from '@/components/ui/BgVideo';
import Reveal from '@/components/ui/Reveal';
import CampProgram from '@/components/sections/CampProgram';
import badge from '@/assets/kamp-badge.png';
import seal from '@/assets/seal.png';
import { camp, cta } from '@/content/site';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Strong ease-in-out (the codebase's on-screen movement curve), for the badge's flight. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The camp opener and the camp programme on one stage, so going from one to
 * the other is a single fluid move rather than a new page sliding in.
 *
 * Behind both is one screen-sized layer that holds still (CSS sticky) while
 * the content scrolls over it, and the drone fly-in over Jezero Manjača
 * dissolves into a second drone shot, the orbit past the jump tower, as the
 * programme comes up.
 *
 * The camp badge flies up into the navbar as the opener scrolls away: it
 * shrinks into the spot where the name "Banjalučka lasta" sits, the name fades
 * out, and the badge stays there through the programme. When the finale
 * ("Finale na tornju") comes up, the badge fades and the name comes back.
 * Scrolling back reverses all of it. The badge in the opener's layout is the
 * one on screen until the flight begins; then a copy fixed to the screen above
 * the navbar takes over from exactly the same spot. Under reduced motion the badge stays put.
 */
export default function CampStage() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement>(null);
  const program = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLImageElement>(null);
  const fly = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const moving = mounted && !reduce;

  // 0 while the opener fills the screen, 1 once a quarter of it has scrolled away: quick
  // enough that the badge reaches the bar before its spot has scrolled off the top.
  const { scrollYProgress: leaving } = useScroll({ target: opener, offset: ['start start', 'end start'] });
  const trip = useTransform(leaving, (p) => easeInOut(clamp01(p / 0.25)));
  const { scrollY } = useScroll();

  // Puts the flying badge where it belongs for the current scroll position.
  const place = useCallback(() => {
    const el = fly.current;
    const from = spot.current;
    const top = opener.current;
    const name = document.querySelector<HTMLElement>('[data-wordmark]');
    const bar = document.querySelector<HTMLElement>('[data-navbar]');
    if (!el || !from || !top || !name || !bar) return;

    // The spot, from layout offsets rather than its screen rectangle, so the opener's
    // fade-up entrance does not drag the badge along.
    let x0 = 0;
    let y0 = 0;
    let node: HTMLElement | null = from;
    while (node && node !== top) {
      x0 += node.offsetLeft;
      y0 += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    // The flight starts from where the spot is at the moment the opener fills the screen
    // (its top edge at the top of the screen), not from where it is now. Following the spot
    // while the page scrolls would put a fixed element one frame behind the scrolling
    // content, which shows as shaking; this way the path depends only on the flight.

    // The dock: where the name starts, centred on the bar, a little taller than the name.
    const n = name.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    const h = Math.min(b.height - 14, n.height * 1.7);
    const scale = h / from.offsetHeight;
    const x1 = n.left;
    const y1 = b.top + (b.height - h) / 2;

    const t = trip.get();
    const y = y0 + (y1 - y0) * t;
    el.style.transform = `translate3d(${(x0 + (x1 - x0) * t).toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(1 + (scale - 1) * t).toFixed(4)})`;

    // At rest the badge in the opener's layout is the one on screen, scrolling natively with
    // the text. The fixed one only takes over once the flight has begun.
    from.style.visibility = t > 0 ? 'hidden' : '';
    el.style.visibility = t > 0 ? 'visible' : 'hidden';

    // The finale has come up once the stage's bottom edge is above the middle of the screen.
    const gone = (stage.current?.getBoundingClientRect().bottom ?? Infinity) < window.innerHeight * 0.5;
    el.toggleAttribute('data-gone', gone);
    document.documentElement.toggleAttribute('data-camp-badge', t > 0.6 && !gone);
  }, [trip]);

  // Both: a jump (a link, a reload halfway down) can update the scroll before the flight value.
  useMotionValueEvent(scrollY, 'change', place);
  useMotionValueEvent(trip, 'change', place);
  useEffect(() => {
    if (!moving) return;
    place();
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('resize', place);
      document.documentElement.removeAttribute('data-camp-badge');
    };
  }, [moving, place]);

  // 0 while the programme is below the screen, 1 when its top is a third of the way up.
  const { scrollYProgress: arriving } = useScroll({ target: program, offset: ['start end', 'start 0.35'] });
  const tower = useTransform(arriving, (p) => clamp01(p));
  // The opener's own shading gives way to an even, darker one that keeps the timetable readable.
  const dim = useTransform(arriving, (p) => clamp01(p) * 0.72);

  // The second video only loads once the visitor is on their way to the programme.
  const [towerOn, setTowerOn] = useState(false);
  useMotionValueEvent(leaving, 'change', (p) => {
    if (p > 0.15 && !towerOn) setTowerOn(true);
  });

  return (
    // overflow: clip (not hidden) rounds the sheet's corners without breaking the sticky layer.
    <div ref={stage} className="relative isolate overflow-clip rounded-t-[2.25rem] bg-deep text-white sm:rounded-t-[3rem]">
      <div aria-hidden className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden">
        <BgVideo {...camp.video} settle className="absolute inset-0" />
        <motion.div style={{ opacity: tower }} className="absolute inset-0">
          {towerOn && <BgVideo {...camp.tower} className="absolute inset-0" />}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/50 to-deep/10" />
        <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-deep" />

      </div>

      {/*
        The opener. The negative scroll margin cancels the page's 88px anchor offset and adds
        the corner radius, so the "Kamp" link lands with the video filling the screen and the
        rounded corners just above it. The section is that much taller to make up for it.
      */}
      <section
        ref={opener}
        id="kamp"
        className="relative flex min-h-[calc(92svh+2.25rem)] -scroll-mt-[calc(88px+2.25rem)] flex-col justify-end sm:min-h-[calc(92svh+3rem)] sm:-scroll-mt-[calc(88px+3rem)]"
      >
        <div className="shell pb-14 pt-44 md:pb-20">
          <Reveal>
            <div className="flex items-center gap-5">
              {camp.showSeal && <Image src={seal} alt={camp.sealAlt} className="size-14 md:size-16" />}
              {/* Placeholder: the badge that flies is fixed to the screen and starts on this spot. */}
              <Image
                ref={spot}
                src={badge}
                alt={camp.badgeAlt}
                className="h-auto w-40 md:w-52"
              />
            </div>
            <h2 className="display mt-8 max-w-[13ch] text-[clamp(2.75rem,7.5vw,7rem)]">{camp.title}</h2>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-white/85">{camp.text}</p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <ul className="flex flex-wrap gap-x-12 gap-y-6">
              {camp.facts.map((f, i) => (
                <Reveal as="li" key={f.label} delay={0.06 * i}>
                  <span className="display block text-4xl md:text-5xl">{f.value}</span>
                  <span className="mt-2 block text-sm text-white/75">{f.label}</span>
                </Reveal>
              ))}
            </ul>
            <a href={cta.join.href} className="btn btn-primary self-start md:self-auto">
              {cta.join.label}
            </a>
          </div>
        </div>
      </section>

      {/* A screen's worth of open water between the two, so the badge and the change of camera
          have room to happen before the programme text arrives. */}
      <div ref={program} className="scheme-dark relative pt-[45svh]">
        <CampProgram />
      </div>

      {moving &&
        createPortal(
          // Above the navbar (z 50), fixed to the screen; `place` moves it.
          <div ref={fly} aria-hidden className="group pointer-events-none invisible fixed left-0 top-0 z-[55] origin-top-left">
            {/*
              The hand-back to the name at the finale: the badge fades out where it is, with a
              touch of blur, while the name fades in just behind it (see the wordmark in
              Nav.tsx). Nothing moves, so nothing can look like it jumps.
            */}
            <div className="transition-[opacity,filter] duration-[550ms] ease-[cubic-bezier(0.77,0,0.175,1)] group-data-[gone]:opacity-0 group-data-[gone]:blur-[2px]">
              <Image src={badge} alt="" className="h-auto w-40 drop-shadow-[0_12px_20px_rgb(0_25_40/0.45)] md:w-52" />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
