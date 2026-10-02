'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import igor from '@/assets/igor.png';
import texture from '@/assets/texture-tall.jpg';
import { cta, hero, quote } from '@/content/site';

const spring = { stiffness: 150, damping: 20, mass: 0.5 };

/**
 * The poster hero: two headline numbers next to each other on the left, the
 * brochure-style poster as a tall card on the right, at every width. From 640px
 * the explanation and the buttons sit under the numbers in the left column; on
 * phones they run across the full width under both.
 *
 * The diver is a separate layer that is wider than the card, so his head and
 * arm leave the frame on the left and his feet at the top right.
 *
 * Depth comes from three things: the card tilts toward the mouse while the
 * diver slides the other way, he moves faster than the card as the hero
 * scrolls away, and he hovers slightly at rest. All of it is skipped under
 * reduced motion; touch screens get the scroll and hover parts only.
 */
export default function HeroPoster() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const tilt = useTransform(
    [sx, sy],
    ([x, y]: number[]) => `perspective(1100px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`,
  );
  // Scroll moves him up and away from the quote, never down onto it.
  const figure = useTransform([sx, sy, scrollYProgress], ([x, y, scrolled]: number[]) => {
    const p = reduce ? 0 : scrolled;
    return `translate3d(calc(${(-p * 5).toFixed(2)}% + ${(-x * 22).toFixed(1)}px), calc(${(-p * 10).toFixed(2)}% + ${(-y * 14).toFixed(1)}px), 0)`;
  });

  // Mouse position across the viewport, -0.5 to 0.5. Touch and pen are ignored.
  function onPointerMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== 'mouse') return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <section id="top" ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="relative overflow-x-clip">
      {/*
        Three pieces on one grid: the numbers, the poster, the explanation with the buttons.
        Phones: the numbers left of the poster, at its foot (the diver's head comes out of the
        card above them), the explanation underneath across the full width.
        From 640px: numbers above the explanation in the left column, both centred against
        the poster, which takes the right column.
      */}
      <div className="shell grid min-h-[100svh] grid-cols-[minmax(0,1fr)_auto] content-start gap-y-5 pb-10 pt-[6.25rem] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:content-center sm:gap-y-9 sm:pb-16 sm:pt-28">
        {/* The name is in the navbar, so the page title is for screen readers and search engines only. */}
        <h1 className="sr-only">{hero.srTitle}</h1>

        {/* The numbers, next to each other at every width. The column is a container and they
            are sized from its width (cqi), so the pair always fits beside the poster.
            Phones: each one is as wide as its digits, with a short two-line label under it; the
            pair sits at the foot of the poster, below the diver's head.
            From 640px: two equal columns with the full labels. */}
        <div className="@container self-end">
          <div className="hero-rise flex gap-x-[7cqi] sm:grid sm:grid-cols-2 sm:gap-x-[5cqi]">
            {hero.stats.map((s, i) => (
              <div key={s.value} className="w-min sm:w-auto">
                <p className={`display whitespace-nowrap text-[25cqi] leading-[0.8] sm:text-[24cqi] ${i === 1 ? 'text-accent' : ''}`}>
                  {s.value}
                  <span className="align-top text-[0.4em]">{s.unit}</span>
                </p>
                <p className="mt-[4.5cqi] text-xs leading-tight text-muted sm:mt-[3.5cqi] sm:max-w-[24ch] sm:text-sm sm:leading-snug md:text-base md:leading-snug">
                  <span className="sm:hidden">{s.short}</span>
                  <span className="max-sm:hidden">{s.label}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Poster. The diver is wider than the card and comes out of it on the left. */}
        <div className="relative flex justify-end sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:self-center">
          {/* On phones the card is sized from the viewport (and capped by its height), which
              leaves the numbers their column. From 640px it takes 73% of its own column. */}
          <div className="@container relative w-[min(46vw,19rem,30svh)] sm:w-[73%]">
            <div className="hero-card">
              {/* The card is at least 3:4 (7:10 from 640px). The top padding is the diver's zone, so
                  the quote always starts below his chest: on a small card, where the words cannot
                  shrink any further, the card grows taller instead of the diver landing on them. */}
              <motion.div
                style={{ transform: tilt }}
                className="relative flex min-h-[133.33cqi] flex-col justify-end overflow-hidden rounded-[var(--radius)] bg-deep pt-[82cqi] shadow-[0_40px_70px_-30px_rgb(0_25_40/0.6)] ring-1 ring-white/10 sm:min-h-[142.86cqi] sm:pt-[91.5cqi]"
              >
                <Image
                  src={texture}
                  alt=""
                  fill
                  priority
                  placeholder="blur"
                  sizes="(min-width: 640px) 33vw, 46vw"
                  className="object-cover"
                />
                {/* Sized in cqi (card widths), with a floor so the words stay readable on phones. */}
                <blockquote className="relative m-[2.8cqi] rounded-[calc(var(--radius)-4px)] bg-panel p-[5cqi] text-on-panel">
                  <p className="display text-[max(0.62rem,5.3cqi)] leading-[1.04]">„{quote.text}“</p>
                  <footer className="mt-[3.6cqi] text-[clamp(0.66rem,4cqi,0.95rem)] leading-snug">
                    <span className="block font-semibold">{quote.author}</span>
                    <span className="block opacity-75">{quote.role}</span>
                  </footer>
                </blockquote>
              </motion.div>
            </div>

            {/* Offsets in card widths, so he keeps his place when the card grows taller. */}
            <div className="pointer-events-none absolute left-[-24%] top-[-4cqi] w-[120%] sm:left-[-30%] sm:top-[-5cqi] sm:w-[135%]">
              <div className="hero-dive">
                <motion.div style={{ transform: figure }} className="will-change-transform">
                  <div className="hero-float">
                    <Image
                      src={igor}
                      alt={quote.photoAlt}
                      priority
                      sizes="(min-width: 640px) 45vw, 56vw"
                      className="h-auto w-full drop-shadow-[0_26px_30px_rgb(0_25_40/0.45)]"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* What this is, and the two ways in. */}
        <div className="hero-rise col-span-2 sm:col-span-1 sm:col-start-1 sm:row-start-2 sm:self-start" style={{ '--i': 1 } as React.CSSProperties}>
          <p className="max-w-[46ch] text-[0.95rem] leading-normal sm:text-base sm:leading-relaxed md:text-lg lg:text-xl lg:leading-relaxed">
            {hero.lead}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
            <a href={cta.join.href} className="btn btn-primary">
              {cta.join.label}
              <ArrowRightIcon size={18} weight="bold" />
            </a>
            <a href={cta.watch.href} className="btn btn-ghost">
              {cta.watch.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
