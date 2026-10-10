'use client';

import { useEffect, useRef, useState } from 'react';
import Streaks from '@/components/ui/Streaks';
import Image from 'next/image';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
  type Variants,
} from 'motion/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import Reveal from '@/components/ui/Reveal';
import pattern from '@/assets/pattern.png';
import { winners, winnersHead } from '@/content/site';

const total = winners.length;
const easeOut = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mod = (n: number, m: number) => ((n % m) + m) % m;
/** The shortest way round the circle from the middle to a card, in cards: -total/2 up to total/2. */
const around = (d: number) => mod(d + total / 2, total) - total / 2;

/** How much smaller a card is 0, 1, 2 and 3 or more places from the middle. */
const SHRINK = [0, 0.18, 0.34, 0.44];
const shrink = (a: number) => {
  const i = Math.min(Math.floor(a), SHRINK.length - 1);
  const j = Math.min(i + 1, SHRINK.length - 1);
  return SHRINK[i] + (SHRINK[j] - SHRINK[i]) * (a - i);
};
/**
 * How far a card is pulled toward the middle, in card widths: half of its own
 * shrink plus the whole shrink of every card between it and the middle. This is
 * what keeps the gap between any two neighbours the same at every position.
 * `pull(2)` is 0.35, which is where the 3.3 in `.era-rail` (globals.css) comes from.
 */
const pull = (a: number) => {
  let p = shrink(a) / 2;
  for (let k = a - 1; k >= 0; k -= 1) p += shrink(k);
  return p;
};
/** Cards further out than this are off screen; they all wait at the same spot. */
const REACH = 3.2;

/**
 * The winners page: every winner of the jumps from Gradski most since 1979, as
 * a circular carousel of tall rounded cards, one per year. Each card carries
 * the year, the winner and one thing Banja Luka lived through that year.
 * Five are on screen: the middle one at full size, one on each side a little
 * smaller, and one more on each side, smaller again and cut in half by the
 * edge of the screen. It has no first or last card: after 2026 comes 1979.
 *
 * The cards are not in a scrolling box. One number, `position`, says which
 * card is in the middle (2.5 is halfway between the third and fourth), and
 * every card works out its own place, size and dimming from how far round the
 * circle it is from that number. That is what makes the loop endless without
 * copies of the cards.
 *
 * `position` moves with a finger or mouse drag, a sideways trackpad scroll, the
 * arrow keys, the two buttons, or a click on a side card, and then settles on
 * the nearest card with a spring. Vertical swipes still scroll the page.
 *
 * Below 768px the cards are too narrow for text, so they show only the year,
 * set upright along the card, and the winner and the city's year for the
 * middle card sit underneath the carousel.
 *
 * Under reduced motion the carousel jumps from card to card instead of gliding.
 */
export default function Winners() {
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const position = useMotionValue(0);
  /** Where the carousel is heading, in whole cards. Not wrapped: it keeps counting up or down. */
  const aim = useRef(0);
  const run = useRef<AnimationPlaybackControls | null>(null);

  useMotionValueEvent(position, 'change', (p) => {
    const i = mod(Math.round(p), total);
    setActive((prev) => (prev === i ? prev : i));
  });

  function settle(target: number, velocity = 0) {
    aim.current = target;
    run.current?.stop();
    if (reduce) {
      position.set(target);
      return;
    }
    // No overshoot: the card glides in and stops.
    run.current = animate(position, target, { type: 'spring', stiffness: 170, damping: 26, velocity });
  }

  /** How many px the middle card travels to become the next card over. */
  function stride() {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>('[data-era]');
    if (!el || !card) return 1;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return card.offsetWidth * (1 - pull(1)) + gap;
  }

  // Drag with a finger or the mouse.
  const grab = useRef({ from: 0, px: 1 });
  const dragged = useRef(false);

  function onPanStart() {
    run.current?.stop();
    dragged.current = true;
    grab.current = { from: position.get(), px: stride() };
  }
  function onPan(_: PointerEvent, info: PanInfo) {
    position.set(grab.current.from - info.offset.x / grab.current.px);
  }
  function onPanEnd(_: PointerEvent, info: PanInfo) {
    // Let go: carry the throw a little further, then settle on the nearest card. Both the
    // speed (cards per second) and the throw are capped, so the hardest flick still moves
    // the carousel two or three cards, not a spin.
    const speed = clamp(-info.velocity.x / grab.current.px, -14, 14);
    settle(Math.round(position.get() + clamp(speed * 0.18, -2.4, 2.4)), speed);
    // The click that ends a drag must not count as a click on a card.
    setTimeout(() => (dragged.current = false), 0);
  }

  // A sideways scroll on a trackpad moves the carousel; up and down still scrolls the page.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let idle: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      run.current?.stop();
      position.set(position.get() + e.deltaX / stride());
      clearTimeout(idle);
      idle = setTimeout(() => settle(Math.round(position.get())), 110);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(idle);
    };
    // `settle` only reads refs and `reduce`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, reduce]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    settle(aim.current + (e.key === 'ArrowRight' ? 1 : -1));
  }

  function pick(index: number) {
    if (dragged.current) return;
    const away = Math.round(around(index - position.get()));
    if (away !== 0) settle(Math.round(position.get()) + away);
  }

  // The five cards on screen arrive one after another, left to right.
  const deal: Variants = {
    hidden: { opacity: 0, transform: `translate3d(${reduce ? 0 : 72}px, 0, 0)` },
    show: (slot: number) => ({
      opacity: 1,
      transform: 'translate3d(0px, 0, 0)',
      transition: { duration: reduce ? 0.3 : 0.8, delay: reduce ? 0 : 0.05 + slot * 0.06, ease: easeOut },
    }),
  };

  return (
    <section
      aria-labelledby="pobjednici-naslov"
      className="era-rail relative isolate flex min-h-[100svh] flex-col pb-7 pt-[calc(env(safe-area-inset-top,0px)+7.75rem)] sm:pb-10 sm:pt-32"
    >
      <Streaks side="right" />
      <div className="shell flex items-end justify-between gap-8">
        <Reveal>
          {/* One line at every width. On phones it is sized from the screen width so that it
              exactly fills it ("Pobjednici skokova" is 7.5 em wide in Big Shoulders). */}
          <h2
            id="pobjednici-naslov"
            className="display whitespace-nowrap text-[min(4.5rem,calc((100vw-2rem)/7.6))] sm:text-[clamp(2.75rem,7vw,4.5rem)] lg:text-[clamp(3.5rem,5vw,5.5rem)]"
          >
            {winnersHead.title}
          </h2>
        </Reveal>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <button type="button" onClick={() => settle(aim.current - 1)} aria-label="Prethodna godina" className="btn btn-ghost size-12 justify-center p-0">
            <ArrowLeftIcon size={20} weight="bold" />
          </button>
          <button type="button" onClick={() => settle(aim.current + 1)} aria-label="Sljedeća godina" className="btn btn-ghost size-12 justify-center p-0">
            <ArrowRightIcon size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* The carousel. Every card sits in the middle of this box and is moved out to its place
          by its own transform; the box cuts off whatever reaches past the screen edge. */}
      <div className="flex flex-1 items-center">
        <motion.div
          ref={rail}
          role="group"
          aria-roledescription="karusel"
          aria-label="Pobjednici po godinama"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="w-full touch-pan-y select-none overflow-x-clip pb-11 pt-3 [column-gap:var(--gap)] pointer-fine:cursor-grab pointer-fine:active:cursor-grabbing"
        >
          <ul className="relative h-[var(--card-h)]">
            {winners.map((item, i) => (
              <Era
                key={item.year}
                item={item}
                index={i}
                position={position}
                current={active === i}
                entrance={deal}
                slot={clamp(Math.round(around(i)) + 2, 0, 4)}
                onPick={() => pick(i)}
              />
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Phones and small tablets: the winner and the city's year for the middle card. All of
          them are stacked in one spot and each fades in as its card reaches the middle, so the
          block never changes height. Screen readers get the same text from the cards themselves. */}
      <div aria-hidden className="shell grid md:hidden">
        {winners.map((item, i) => (
          <Caption key={item.year} item={item} index={i} position={position} />
        ))}
      </div>
    </section>
  );
}

type Item = (typeof winners)[number];

type EraProps = {
  item: Item;
  index: number;
  position: MotionValue<number>;
  current: boolean;
  entrance: Variants;
  /** 0 to 4, left to right, for the five cards on screen at the start: the order they arrive in. */
  slot: number;
  onPick: () => void;
};

function Era({ item, index, position, current, entrance, slot, onPick }: EraProps) {
  // Signed distance round the circle from the middle, in cards.
  const distance = useTransform(position, (p) => around(index - p));
  const transform = useTransform(distance, (d) => {
    const a = Math.min(Math.abs(d), REACH);
    const side = Math.sign(d);
    // Card widths as a percentage of the card itself, plus one gap per card passed.
    return `translate3d(calc(${(side * (a - pull(a)) * 100).toFixed(2)}% + ${(side * a).toFixed(3)} * var(--gap)), 0, 0) scale(${(1 - shrink(a)).toFixed(4)})`;
  });
  const opacity = useTransform(distance, (d) => {
    const a = Math.abs(d);
    return a <= 1 ? 1 - 0.18 * a : 0.82 - 0.27 * Math.min(a - 1, 1);
  });
  // 1 for the card in the middle, 0 from one card away: its shadow and its pattern.
  const lift = useTransform(distance, (d) => clamp(1 - Math.abs(d), 0, 1));
  // The cards waiting off screen are not drawn at all; with forty of them that matters on phones.
  const visibility = useTransform(distance, (d) => (Math.abs(d) < REACH ? 'visible' : 'hidden'));

  return (
    <motion.li
      data-era
      style={{ transform, opacity, visibility }}
      aria-current={current ? 'true' : undefined}
      // Its own layer with its back hidden: browsers then move and scale the card as one finished
      // picture instead of redrawing the text at every new size, which makes letters shimmer.
      className="@container absolute left-1/2 top-0 ml-[calc(var(--card-w)/-2)] w-[var(--card-w)] will-change-transform [backface-visibility:hidden]"
    >
      {/* The entrance slides this inner layer; the list item above is busy holding its place. */}
      <motion.div variants={entrance} custom={slot}>
        {/* Type, padding and corners are sized in cqi, against the list item (the container). */}
        <article
          onClick={onPick}
          className="squircle relative isolate flex h-[var(--card-h)] flex-col justify-between bg-panel p-[8cqi] text-on-panel"
        >
          <motion.div aria-hidden style={{ opacity: lift }} className="pointer-events-none absolute inset-0 -z-10">
            <span className="squircle absolute inset-0 shadow-[0_30px_46px_-28px_rgb(0_25_40/0.75)]" />
            {/* The same artwork on every card, cropped and mirrored differently so no two match. */}
            <span className="squircle absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_10%,transparent_72%)]">
              <Image
                src={pattern}
                alt=""
                fill
                sizes="30vw"
                draggable={false}
                className={`object-cover opacity-25 ${index % 2 ? '-scale-x-100' : ''}`}
                style={{ objectPosition: `50% ${(index * 37) % 100}%` }}
              />
            </span>
          </motion.div>

          {/* The year. Below 768px it is the whole card: upright, reading from the bottom up, as
              large as the card's height allows. From 768px it is a headline across the top. */}
          <p className="display whitespace-nowrap text-accent max-md:absolute max-md:inset-0 max-md:grid max-md:place-items-center md:text-[32cqi]">
            {/* cqw, not cqi: in upright text the "inline" direction is vertical, and the card is
                only a container for its width. 2 em is the length of the longest year in Big Shoulders. */}
            <span className="max-md:rotate-180 max-md:text-[min(60cqw,calc((var(--card-h)-22cqw)/2))] max-md:leading-none max-md:[writing-mode:vertical-rl]">
              {item.year}
            </span>
          </p>
          <div className="max-md:sr-only">
            <h3 className="display text-[clamp(1.4rem,10cqi,2.4rem)] leading-[0.95]">{item.name}</h3>
            <p className="mt-[4cqi] text-[clamp(0.875rem,4.8cqi,1.0625rem)] leading-normal text-on-panel/75">{item.city}</p>
          </div>
        </article>
      </motion.div>
    </motion.li>
  );
}

function Caption({ item, index, position }: { item: Item; index: number; position: MotionValue<number> }) {
  // Fully there in the middle, gone by 0.4 of a card away, so two never show at once.
  const opacity = useTransform(position, (p) => clamp(1 - 2.5 * Math.abs(around(index - p)), 0, 1));
  return (
    <motion.div style={{ opacity }} className="col-start-1 row-start-1 mx-auto max-w-[38ch] text-center">
      <p className="display text-[1.75rem] leading-[0.95]">{item.name}</p>
      <p className="mt-2 text-[0.95rem] leading-normal text-muted">{item.city}</p>
    </motion.div>
  );
}
