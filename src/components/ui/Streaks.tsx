'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import pattern from '@/assets/pattern.png';

/**
 * The torn-paper streaks from the club's 2026 brochure, as a faint watermark that bleeds in from
 * one edge of the screen behind a plain section. Only the part near the edge shows (a soft
 * mask fades the rest out), and it drifts a little slower than the page, so the background
 * moves with you without asking for attention. Purely decorative: hidden from screen readers.
 *
 * Put it as the first child of a section that is `relative isolate`. It reaches
 * the screen edge even when the section is narrower than the screen (the .shell max-width).
 */
export default function Streaks({
  side = 'right',
  onDark = false,
  className = '',
}: {
  side?: 'left' | 'right';
  /** On a background that is dark in both themes (the interludes): always the stronger dark-mode strength. */
  onDark?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, (p) => (reduce ? 'none' : `translate3d(0, ${((p - 0.5) * -90).toFixed(1)}px, 0)`));
  const right = side === 'right';

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 -z-10 w-[min(70vw,46rem)] overflow-hidden ${
        right ? 'right-[calc(50%-50vw)] [mask-image:radial-gradient(ellipse_75%_60%_at_100%_45%,black,transparent_72%)]' : 'left-[calc(50%-50vw)] -scale-x-100 [mask-image:radial-gradient(ellipse_75%_60%_at_100%_45%,black,transparent_72%)]'
      } ${className}`}
    >
      <motion.div style={{ transform: drift }} className={`absolute -inset-y-24 inset-x-0 will-change-transform ${onDark ? 'opacity-[0.22]' : 'opacity-[0.07] dark:opacity-[0.22]'}`}>
        <Image src={pattern} alt="" fill sizes="46rem" className="object-cover" />
      </motion.div>
    </div>
  );
}
