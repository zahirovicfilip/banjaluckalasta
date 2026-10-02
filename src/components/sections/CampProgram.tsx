'use client';

import { useId, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import dan1 from '@/assets/kamp/dan-1.jpg';
import dan2 from '@/assets/kamp/dan-2.jpg';
import dan3 from '@/assets/kamp/dan-3.jpg';
import dan4 from '@/assets/kamp/dan-4.jpg';
import dan5 from '@/assets/kamp/dan-5.jpg';
import dan6 from '@/assets/kamp/dan-6.jpg';
import dan7 from '@/assets/kamp/dan-7.jpg';
import { program } from '@/content/site';

// Same order as program.days in src/content/site.ts
const photos: StaticImageData[] = [dan1, dan2, dan3, dan4, dan5, dan6, dan7];

/** The week of the camp as tabs: one photo and one timetable per day, taken from the club's brochure. */
export default function CampProgram() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const day = program.days[active];
  const rows = Math.ceil(day.items.length / 2);

  function onKeyDown(e: React.KeyboardEvent) {
    const n = program.days.length;
    let next = active;
    if (e.key === 'ArrowRight') next = (active + 1) % n;
    else if (e.key === 'ArrowLeft') next = (active - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div id="program" className="shell py-24 md:py-32">
      <h3 className="display text-[clamp(2.25rem,4.8vw,4.5rem)]">{program.title}</h3>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{program.text}</p>

      <motion.div
        layoutScroll
        role="tablist"
        aria-label="Dani kampa"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-[var(--gutter)] mt-10 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:mx-0 md:px-0"
      >
        {program.days.map((d, i) => {
          const selected = i === active;
          return (
            <button
              key={d.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${d.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 active:scale-[0.97] ${
                selected ? 'text-on-accent' : 'text-muted hover:text-ink'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative">
                {d.short} <span className="tabular-nums opacity-80">{d.date.replace(' jun', '')}</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${day.id}`}
        tabIndex={0}
        className="mt-8 grid gap-8 md:grid-cols-12 md:gap-12"
      >
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] bg-surface md:col-span-5">
          {photos.map((src, i) => (
            <Image
              key={program.days[i].id}
              src={src}
              alt={i === active ? program.days[i].alt : ''}
              aria-hidden={i !== active}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              placeholder="blur"
              className={`object-cover transition-opacity duration-500 ease-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>

        <motion.div
          key={day.id}
          initial={{ opacity: 0, transform: `translateY(${reduce ? 0 : 10}px)` }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 md:self-center"
        >
          <p className="text-sm font-semibold text-accent-ink">
            {day.name}, {day.date} 2026.
          </p>
          <p className="mt-2 max-w-[30ch] text-2xl font-semibold leading-snug md:text-3xl">{day.summary}</p>

          <ol
            className="mt-8 grid gap-x-10 gap-y-3 sm:max-md:[grid-auto-flow:column] sm:max-md:[grid-template-rows:repeat(var(--rows),auto)] lg:[grid-auto-flow:column] lg:[grid-template-rows:repeat(var(--rows),auto)]"
            style={{ '--rows': rows } as React.CSSProperties}
          >
            {day.items.map((item) => (
              <li key={item.time + item.label} className="flex items-baseline gap-3">
                <span
                  className={`w-[3.75rem] shrink-0 rounded-full py-0.5 text-center text-sm font-semibold tabular-nums ${
                    item.time ? 'bg-accent/15' : ''
                  }`}
                >
                  {item.time}
                </span>
                <span className={item.key ? 'font-semibold' : 'text-muted'}>{item.label}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>

      <dl className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
        {program.coaches.map((c) => (
          <div key={c.area}>
            <dt className="text-sm text-muted">{c.area}</dt>
            <dd className="mt-1 text-lg font-semibold">{c.names}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
