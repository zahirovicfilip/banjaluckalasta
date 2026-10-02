'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { history } from '@/content/site';

/**
 * Timeline. On md+ with motion allowed, vertical scroll pans the track sideways
 * while the section is pinned. On phones or with reduced motion it is a native
 * horizontal scroll-snap row.
 */
export default function History() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const measure = () => {
      const on = mq.matches && !reduce;
      setPinned(on);
      if (on && track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section
      id="istorija"
      ref={section}
      className="relative bg-surface"
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? 'sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden' : 'py-24'}>
        <div className="shell">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">Od 1936.</p>
          <h2 className="display mt-4 max-w-[16ch] text-[clamp(2.5rem,5.5vw,5rem)]">Devet decenija sa mosta</h2>
        </div>

        <motion.ol
          ref={track}
          style={pinned ? { x } : undefined}
          className={`mt-12 flex gap-5 px-4 md:mt-16 md:gap-8 md:px-10 ${
            pinned ? 'w-max' : 'snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none]'
          }`}
        >
          {history.map((h) => (
            <li
              key={h.year}
              className="flex w-[78vw] shrink-0 snap-start flex-col justify-between rounded-[var(--radius)] border border-line bg-bg p-6 sm:w-[46vw] md:h-[46svh] md:w-[34vw] md:p-8 lg:w-[26vw]"
            >
              <p className="display text-[clamp(3.25rem,6vw,5.5rem)] text-accent">{h.year}</p>
              <div className="mt-10">
                <h3 className="text-xl font-semibold">{h.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{h.text}</p>
              </div>
            </li>
          ))}
          <li aria-hidden className="w-px shrink-0" />
        </motion.ol>
      </div>
    </section>
  );
}
