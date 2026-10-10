'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import Reveal from '@/components/ui/Reveal';
import camo from '@/assets/camo.svg';
import logo from '@/assets/airsoft/logo.jpg';
import players from '@/assets/airsoft/igraci.jpg';
import aim from '@/assets/airsoft/pokret.jpg';
import gameDay from '@/assets/airsoft/game-day.jpg';
import tournament from '@/assets/airsoft/turnir.jpg';
import { airsoft } from '@/content/site';

/** Four corner marks, like a sight's frame, around whatever they sit in. */
function Brackets({ className = '' }: { className?: string }) {
  const corner = 'absolute size-4 border-accent';
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
    </span>
  );
}

/**
 * The airsoft club "Arhangel Mihailo", run by the same people as the jumping club.
 *
 * While this section holds the middle of the screen the whole site changes uniform: it sets
 * <html data-airsoft>, which fades the palette from the club's blues to the airsoft club's
 * olive and black (globals.css) and swaps the name in the navbar for "Airsoft / Arhangel
 * Mihailo" (Nav.tsx). Scrolling on or back changes it back.
 *
 * The section itself sits on a woodland camo (src/assets/camo.svg, drawn for the site) that
 * drifts slower than the page, with the club's photos and posters in sight-frame corners.
 */
export default function Airsoft() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // The theme belongs to this section only: on while it crosses the middle of the screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    // The document's own viewport as the root, so it also works when the site is framed.
    const io = new IntersectionObserver(([e]) => root.toggleAttribute('data-airsoft', e.isIntersecting), {
      root: document,
      rootMargin: '-50% 0px -50% 0px',
    });
    io.observe(el);
    return () => {
      io.disconnect();
      root.removeAttribute('data-airsoft');
    };
  }, []);

  // The camo moves at about two thirds of the page's speed, so it reads as a layer behind.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, (p) => (reduce ? 'none' : `translate3d(0, ${((p - 0.5) * 30).toFixed(2)}%, 0)`));

  return (
    <section ref={ref} id="airsoft" aria-labelledby="airsoft-naslov" className="relative isolate overflow-clip bg-deep text-white">
      {/* Camo, taller than the section so it can drift, darkened toward the edges for the words. */}
      <motion.div
        aria-hidden
        style={{ transform: drift, backgroundImage: `url(${camo.src})`, backgroundSize: '520px 520px' }}
        className="absolute inset-x-0 -inset-y-[20%] -z-10 opacity-45"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_35%,transparent_10%,var(--deep)_78%)]" />

      <div className="shell py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
          <Reveal className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <Image src={logo} alt={airsoft.alts.logo} className="size-16 rounded-full ring-2 ring-accent/60 md:size-20" />
            </div>
            <h2 id="airsoft-naslov" className="display font-stencil mt-8 text-[clamp(3rem,13vw,5rem)] lg:text-[clamp(3.5rem,6vw,6.25rem)]">
              {airsoft.title}
            </h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-white/85 md:text-xl">{airsoft.lead}</p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-white/65">{airsoft.link}</p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {airsoft.values.map((v) => (
                <li key={v} className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-white/90">
                  {v}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Two of the club's photos, overlapping, each in sight-frame corners. */}
          <Reveal delay={0.1} className="relative mx-auto w-full max-w-md lg:col-span-5">
            <div className="relative aspect-square w-[82%]">
              <div className="absolute inset-0 overflow-hidden rounded-[var(--radius)] shadow-[0_40px_70px_-30px_rgb(0_0_0/0.8)]">
                <Image src={players} alt={airsoft.alts.players} fill placeholder="blur" sizes="(min-width: 1024px) 30vw, 75vw" className="object-cover" />
              </div>
              <Brackets className="-inset-3" />
            </div>
            <div className="relative -mt-[38%] ml-auto aspect-[3/4] w-[52%] rotate-2">
              <div className="absolute inset-0 overflow-hidden rounded-[var(--radius)] ring-4 ring-deep shadow-[0_40px_70px_-30px_rgb(0_0_0/0.85)]">
                <Image src={aim} alt={airsoft.alts.aim} fill placeholder="blur" sizes="(min-width: 1024px) 20vw, 48vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* What the club runs: an open list, the stencil names large, no boxes around them. */}
        <ul className="mt-20 divide-y divide-white/10 border-y border-white/10 md:mt-28">
          {airsoft.formats.map((f, i) => (
            <Reveal
              as="li"
              key={f.name}
              delay={0.06 * i}
              className="group grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-10 md:py-10"
            >
              <h3 className="display font-stencil text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] transition-colors duration-300 md:col-span-6 pointer-fine:group-hover:text-accent">
                {f.name}
              </h3>
              <p className="max-w-[44ch] text-lg leading-relaxed text-white/75 md:col-span-6">{f.text}</p>
            </Reveal>
          ))}
        </ul>

        {/* The posters, and the way to the club. */}
        <div className="mt-16 grid gap-6 md:grid-cols-12 md:items-end">
          <Reveal className="grid grid-cols-2 gap-4 md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
              <Image src={gameDay} alt={airsoft.alts.gameDay} fill placeholder="blur" sizes="(min-width: 768px) 28vw, 46vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius)]">
              <Image src={tournament} alt={airsoft.alts.tournament} fill placeholder="blur" sizes="(min-width: 768px) 28vw, 46vw" className="object-cover object-top" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <p className="display font-stencil text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[0.95]">{airsoft.slogan}</p>
            <a href={airsoft.instagram.href} target="_blank" rel="noreferrer" className="btn btn-primary mt-8">
              {airsoft.instagram.label}
              <ArrowUpRightIcon size={18} weight="bold" />
            </a>
            <p className="mt-3 text-sm text-white/60">{airsoft.instagram.handle}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
