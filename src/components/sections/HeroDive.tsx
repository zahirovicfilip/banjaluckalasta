'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRightIcon } from '@phosphor-icons/react';
import LastaHero from '@/components/lasta/LastaHero';
import { cta, hero } from '@/content/site';

/** Piecewise-linear map, clamped at both ends. */
function lerp(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (v <= input[i]) return output[i - 1] + ((v - input[i - 1]) / (input[i] - input[i - 1])) * (output[i] - output[i - 1]);
  }
  return output[output.length - 1];
}

/**
 * Function-form transform on purpose: Motion hands range-form opacity transforms
 * to a native ScrollTimeline, which misreads this sticky layout's scroll range.
 */
function useRamp(p: MotionValue<number>, input: number[], output: number[]) {
  return useTransform(p, (v) => lerp(v, input, output));
}

/** Fades a layer in over [from-fade, from] and out over [to-fade, to], in scroll progress. */
function useWindow(p: MotionValue<number>, from: number, to: number, fade = 0.05) {
  return useRamp(p, [from - fade, from, to - fade, to], [0, 1, 1, 0]);
}

function Phase({ p, word, line, from, to }: { p: MotionValue<number>; word: string; line: string; from: number; to: number }) {
  const reduce = useReducedMotion();
  const opacity = useWindow(p, from, to);
  const x = useRamp(p, [from - 0.05, from, to], reduce ? [0, 0, 0] : [-40, 0, 24]);
  return (
    <motion.div style={{ opacity, x }} className="absolute inset-x-4 bottom-10 md:inset-x-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
      <p className="display text-[clamp(4rem,14vw,13rem)] text-ink/10">{word}</p>
      <p className="mt-2 max-w-[30ch] text-base text-muted md:text-lg">{line}</p>
    </motion.div>
  );
}

/**
 * The animated hero. Switched on with `hero.animated` in src/content/site.ts.
 *
 * The scroll-driven dive (LastaHero) layered over a pinned text layer, like a
 * magazine cover: the diver stands in front of the masthead and flies over it.
 * Scroll progress here matches the engine's progress 1:1 (same element, same
 * span), so the captions line up with the phases of the jump.
 */
export default function HeroDive() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const introOpacity = useRamp(p, [0, 0.06, 0.12], [1, 1, 0]);
  const titleY = useRamp(p, [0, 0.12], reduce ? [0, 0] : [0, 60]);
  const outroOpacity = useRamp(p, [0.86, 0.92], [0, 1]);

  return (
    <div ref={ref} id="top" className="relative">
      {/* Text layer sits behind the diver; the stage ignores the pointer so CTAs stay clickable. */}
      <div className="absolute inset-0 z-0 overflow-x-clip">
        <div className="shell sticky top-0 h-[100svh]">
          <motion.div style={{ opacity: introOpacity }} className="absolute inset-0 flex flex-col px-4 pb-8 pt-24 md:px-10 md:pb-12 md:pt-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">{hero.eyebrow}</p>

            <motion.h1
              style={{ y: titleY }}
              className="display my-auto text-[clamp(2rem,10vw,11.5rem)] leading-[0.86] text-[var(--hero-title)]"
            >
              <span className="block">Banjalučka</span>
              <span className="block">lasta</span>
            </motion.h1>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[40ch] text-base leading-relaxed text-muted md:text-lg">{hero.sub}</p>
              <div className="relative z-30 flex flex-wrap gap-3">
                <a href={cta.join.href} className="btn btn-primary">
                  {cta.join.label}
                  <ArrowRightIcon size={18} weight="bold" />
                </a>
                <a href={cta.watch.href} className="btn btn-ghost">
                  {cta.watch.label}
                </a>
              </div>
            </div>
          </motion.div>

          {hero.phases.map((ph) => (
            <Phase key={ph.word} p={p} {...ph} />
          ))}

          <motion.p
            style={{ opacity: outroOpacity }}
            className="absolute inset-x-4 bottom-8 text-center text-sm font-medium text-muted md:bottom-12"
          >
            {hero.outro}
          </motion.p>
        </div>
      </div>

      {/* color="currentColor" lets the figure follow --hero-figure, which changes with the theme. */}
      <LastaHero
        length={360}
        label={hero.a11yLabel}
        color="currentColor"
        className="pointer-events-none relative z-10 text-[var(--hero-figure)]"
      />
    </div>
  );
}
