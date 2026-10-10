'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';
import dan1 from '@/assets/kamp/dan-1.jpg';
import dan2 from '@/assets/kamp/dan-2.jpg';
import dan3 from '@/assets/kamp/dan-3.jpg';
import dan4 from '@/assets/kamp/dan-4.jpg';
import dan5 from '@/assets/kamp/dan-5.jpg';
import dan6 from '@/assets/kamp/dan-6.jpg';
import dan7 from '@/assets/kamp/dan-7.jpg';
import { program } from '@/content/site';

// Same order as program.days in src/content/site.ts. Several are tall video frames shown in a
// wider frame, so each says which part to keep (CSS object-position).
const photos: { src: StaticImageData; focus: string }[] = [
  { src: dan1, focus: '50% 50%' },
  { src: dan2, focus: '50% 40%' },
  { src: dan3, focus: '55% 50%' },
  { src: dan4, focus: '50% 50%' },
  { src: dan5, focus: '55% 42%' },
  { src: dan6, focus: '50% 58%' },
  { src: dan7, focus: '50% 40%' },
];

/** Critically damped: the content glides to its place and stops, no overshoot (it is a page, not a toy). */
const glide = { type: 'spring', bounce: 0, duration: 0.45 } as const;
/** Where a flick would carry the content if it kept going, like a scroll decelerating (Apple's projection). */
const project = (velocity: number, rate = 0.99) => ((velocity / 1000) * rate) / (1 - rate);

/**
 * The camp week, one day at a time, chosen by the visitor.
 *
 * The seven days sit in a rail of buttons (a tab list). Picking one moves the highlight pill
 * across to it with a spring, and the day's photo, name, summary and full timetable take the
 * stage. All seven days are laid on top of each other in one spot: the chosen one is in place,
 * the earlier ones wait just to the left and the later ones just to the right, so changing day
 * always moves in the direction of travel, and a quick run of taps never jumps (each move
 * starts from wherever the content is). Because the spot is as tall as the longest day, the
 * page below never shifts.
 *
 * On a touch screen the day can also be swiped: it follows the finger, resists at the first and
 * last day, and a short flick is enough (the release speed counts, not just the distance).
 * Arrow keys, Home and End work on the rail. Under reduced motion the days crossfade in place.
 */
export default function CampProgram() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const n = program.days.length;

  // Swiping is for touch; with a mouse the rail is the way, and text stays selectable.
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => setTouch(coarse.matches);
    update();
    coarse.addEventListener('change', update);
    return () => coarse.removeEventListener('change', update);
  }, []);

  function go(next: number, focus = false) {
    const i = Math.max(0, Math.min(n - 1, next));
    setActive(i);
    if (focus) tabs.current[i]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: n - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  }

  const stage = useRef<HTMLDivElement>(null);
  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const width = stage.current?.clientWidth ?? 360;
    const landing = info.offset.x + project(info.velocity.x);
    if (landing < -width * 0.22) go(active + 1);
    else if (landing > width * 0.22) go(active - 1);
  }

  return (
    <div id="program" className="shell py-24 md:py-32">
      <h3 className="display text-[clamp(3.25rem,10vw,8rem)]">{program.title}</h3>
      <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted md:text-xl">{program.text}</p>

      {/* The rail: seven days, the chosen one on a sliding pill. */}
      <div
        role="tablist"
        aria-label="Dani kampa"
        onKeyDown={onKeyDown}
        className="mt-12 grid grid-cols-7 gap-1 rounded-full bg-white/[0.06] p-1 md:mt-16 md:gap-2 md:p-1.5"
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
              aria-controls={`${uid}-panel-${d.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => go(i)}
              className={`relative rounded-full py-2.5 transition-[color,transform] duration-150 ease-out active:scale-[0.96] md:py-3.5 ${
                selected ? 'text-on-accent' : 'text-white/60 pointer-fine:hover:text-white'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.4 }}
                />
              )}
              <span className="relative block text-center leading-none">
                <span className="display block text-[0.8rem] md:text-base">{d.short}</span>
                <span className="display mt-1 block text-xl tabular-nums md:text-3xl">{d.date.replace(' jun', '')}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* The stage: every day in the same spot, only the chosen one in view. */}
      <motion.div
        ref={stage}
        drag={touch ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={active === 0 || active === n - 1 ? 0.18 : 0.5}
        dragSnapToOrigin
        onDragEnd={onDragEnd}
        className="mt-10 grid touch-pan-y md:mt-14"
      >
        {program.days.map((day, i) => {
          const here = i === active;
          // Earlier days wait to the left, later days to the right.
          const side = Math.sign(i - active);
          return (
            <motion.section
              key={day.id}
              role="tabpanel"
              id={`${uid}-panel-${day.id}`}
              aria-labelledby={`${uid}-tab-${day.id}`}
              aria-hidden={!here}
              inert={!here}
              initial={false}
              animate={
                reduce
                  ? { opacity: here ? 1 : 0 }
                  : { opacity: here ? 1 : 0, transform: `translate3d(${side * 7}%, 0, 0)` }
              }
              transition={reduce ? { duration: 0.2 } : glide}
              className={`col-start-1 row-start-1 grid content-start gap-8 md:grid-cols-12 md:gap-12 ${here ? '' : 'pointer-events-none'}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius)] bg-white/5 md:col-span-5 md:aspect-[4/5]">
                <Image
                  src={photos[i].src}
                  alt={day.alt}
                  fill
                  draggable={false}
                  sizes="(min-width: 768px) 40vw, 92vw"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: photos[i].focus }}
                />
              </div>

              <div className="md:col-span-7 md:pt-2">
                <h4 className="display text-[clamp(3rem,9vw,6.5rem)]">{day.name}</h4>
                <p className="mt-2 text-lg text-muted">{day.date} 2026.</p>
                <p className="mt-5 max-w-[30ch] text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug">{day.summary}</p>

                {/* The whole day, hour by hour. The highlights are bright, the routine is quieter. */}
                <ol className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                  {day.items.map((item) => (
                    <li key={item.time + item.label} className="grid grid-cols-[3.25rem_1fr] items-baseline gap-3">
                      <span className="display text-xl tabular-nums text-accent">{item.time}</span>
                      <span className={item.key ? 'font-semibold text-white' : 'text-white/65'}>{item.label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      {/* The coaches: names large, what they teach under them. */}
      <dl className="mt-20 grid gap-10 border-t border-white/10 pt-10 md:mt-28 md:grid-cols-2 md:gap-12">
        {program.coaches.map((c) => (
          <div key={c.area} className="flex flex-col">
            <dt className="order-2 mt-3 text-lg text-muted">{c.area}</dt>
            <dd className="order-1 display text-[clamp(1.9rem,3.6vw,3rem)] leading-[0.95]">{c.names}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
