'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Reveal from '@/components/ui/Reveal';
import members from '@/assets/kamp/zajednica.jpg';
import water from '@/assets/interlude/kajaci.jpg';
import { community } from '@/content/site';

/**
 * "Klub van mosta": the club's work for the river and the city. It matters, but less than the
 * jumping, so it gets a quiet highlight rather than a chapter: a band in the soft surface tone,
 * edge to edge, with the club's own photos. Calm on purpose: one headline, one blue number.
 *
 * Left, the words, read top to bottom: the title, one line on what the work is, the turnout of
 * the Vrbas cleanup as the number that proves it, and the two kinds of work in plain text. Right, two photos overlapping at a
 * slight angle; as the band scrolls past they drift at different speeds, which gives the pair
 * depth. Under reduced motion they hold still.
 */
export default function Community() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const back = useTransform(scrollYProgress, (p) => (reduce ? 'rotate(2deg)' : `translate3d(0, ${((0.5 - p) * 40).toFixed(1)}px, 0) rotate(2deg)`));
  const front = useTransform(scrollYProgress, (p) => (reduce ? 'rotate(-4deg)' : `translate3d(0, ${((0.5 - p) * 110).toFixed(1)}px, 0) rotate(-4deg)`));

  return (
    <section ref={ref} aria-labelledby="klub-naslov" className="relative isolate overflow-clip bg-surface">
      <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:items-center lg:gap-16">
        {/* One reading order, top to bottom: the title, one sentence, the number, then the two
            kinds of work in plain text. Only the title is display type; only the number is blue. */}
        <div className="lg:col-span-6">
          <Reveal>
            <h2 id="klub-naslov" className="display text-[clamp(3rem,8vw,5.5rem)]">
              {community.title}
            </h2>
            <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-muted md:text-xl">{community.lead}</p>
          </Reveal>

          <Reveal delay={0.08} className="mt-10 flex items-center gap-5 border-t border-line pt-8">
            <span className="display text-[clamp(3rem,6vw,4.5rem)] leading-none text-accent-ink">{community.stat.value}</span>
            <span className="max-w-[26ch] leading-snug text-muted">{community.stat.label}</span>
          </Reveal>

          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {community.actions.map((a, i) => (
              <Reveal as="li" key={a.title} delay={0.06 * i}>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 max-w-[40ch] leading-relaxed text-muted">{a.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* The club's people, and the water. */}
        <div className="relative mx-auto aspect-[5/6] w-full max-w-md lg:col-span-6 lg:max-w-lg">
          <motion.div
            style={{ transform: back }}
            className="absolute right-0 top-0 aspect-[4/5] w-[78%] overflow-hidden rounded-[var(--radius)] shadow-[0_40px_70px_-30px_rgb(0_25_40/0.6)] will-change-transform"
          >
            <Image src={members} alt={community.alts.members} fill placeholder="blur" sizes="(min-width: 1024px) 28vw, 70vw" className="object-cover" style={{ objectPosition: '45% 55%' }} />
          </motion.div>
          <motion.div
            style={{ transform: front }}
            className="absolute bottom-0 left-0 aspect-[3/4] w-[48%] overflow-hidden rounded-[var(--radius)] ring-[6px] ring-surface shadow-[0_40px_70px_-30px_rgb(0_25_40/0.7)] will-change-transform"
          >
            <Image src={water} alt={community.alts.water} fill placeholder="blur" sizes="(min-width: 1024px) 18vw, 44vw" className="object-cover" style={{ objectPosition: '50% 62%' }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
