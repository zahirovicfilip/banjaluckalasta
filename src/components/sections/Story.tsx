'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import Reveal from '@/components/ui/Reveal';
import Streaks from '@/components/ui/Streaks';
import { bridgePhoto, story } from '@/content/site';
import { ytImage } from '@/lib/youtube';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Strong ease-out, for words arriving. */
const easeOut = (t: number) => 1 - (1 - t) ** 4;
/** Strong ease-in-out, for a sentence leaving. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Scroll, in screen heights (svh), that each card (the title, then each sentence) gets. */
const STEP = 70;
/**
 * Where, inside its share of the scroll (0 to 1), a card arrives, holds and leaves. The words
 * come in over the first part, the sentence then stays still to be read, then dissolves, and
 * there is a short empty pause before the next one starts, so two never overlap.
 */
const IN_END = 0.35;
const OUT_START = 0.7;
const OUT_END = 0.92;

type Card = { kind: 'title' } | { kind: 'beat'; text: string; chapter: number };

/** The title, then every sentence of every chapter, in reading order. */
const cards: Card[] = [
  { kind: 'title' },
  ...story.chapters.flatMap((c, chapter) => c.beats.map((text) => ({ kind: 'beat' as const, text, chapter }))),
];
const last = cards.length - 1;
/** The cards each chapter's year spans, so the year stays while its sentences change. */
const spans = story.chapters.map((_, chapter) => {
  const idx = cards.flatMap((c, i) => (c.kind === 'beat' && c.chapter === chapter ? [i] : []));
  return { first: idx[0], last: idx[idx.length - 1] };
});

/** How far card `i` has left (0 = still there, 1 = gone) at stage position `pos`. */
function leaving(pos: number, i: number) {
  if (i === last) return 0; // the last sentence stays, and scrolls away with the section
  return easeInOut(clamp01((pos - i - OUT_START) / (OUT_END - OUT_START)));
}
/** How far card `i` has arrived (0 = not yet, 1 = in), for its whole length. */
function arriving(pos: number, i: number) {
  if (i === 0) return 1; // the title is already there when the stage scrolls into view
  return clamp01((pos - i) / IN_END);
}

/** One word: it rises into place and fades in, a moment after the word before it. */
function Word({ word, index, count, card, pos, still }: { word: string; index: number; count: number; card: number; pos: MotionValue<number>; still: boolean }) {
  // Each word takes 40% of the arrival, and the starts are spread over the rest.
  const start = count > 1 ? (index / (count - 1)) * 0.6 : 0;
  const t = useTransform(pos, (p) => (still ? 1 : easeOut(clamp01((arriving(p, card) - start) / 0.4))));
  const opacity = useTransform(t, (v) => v);
  const transform = useTransform(t, (v) => (still ? 'none' : `translate3d(0, ${((1 - v) * 0.45).toFixed(3)}em, 0)`));
  return <motion.span style={{ opacity, transform }} className="inline-block">{word}</motion.span>;
}

/**
 * One sentence on the stage. Its words arrive one after another; then it holds still; then the
 * whole sentence dissolves upwards with a touch of blur (which blends the old words away
 * instead of leaving a hard ghost), and the stage is empty for a beat before the next one.
 */
function Sentence({ text, card, pos, still }: { text: string; card: number; pos: MotionValue<number>; still: boolean }) {
  const words = text.split(' ');
  // Under reduced motion the words do not move, so the sentence itself fades in and out.
  const opacity = useTransform(pos, (p) => (still ? arriving(p, card) : 1) * (1 - leaving(p, card)));
  const transform = useTransform(pos, (p) => (still ? 'none' : `translate3d(0, ${(-leaving(p, card) * 0.6).toFixed(3)}em, 0)`));
  const filter = useTransform(pos, (p) => (still ? 'none' : `blur(${(leaving(p, card) * 6).toFixed(2)}px)`));
  return (
    <motion.p
      style={{ opacity, transform, filter }}
      className="col-start-1 row-start-1 max-w-[22ch] self-center text-balance md:max-w-[28ch] text-center text-[clamp(1.6rem,4.6vw,3.25rem)] font-medium leading-[1.22]"
    >
      {words.map((w, i) => (
        <span key={i}>
          <Word word={w} index={i} count={words.length} card={card} pos={pos} still={still} />
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </motion.p>
  );
}

/** A chapter's year above the sentences: it comes in with its first sentence and leaves with its last. */
function Year({ year, first, lastCard, pos, still }: { year: string; first: number; lastCard: number; pos: MotionValue<number>; still: boolean }) {
  const shown = (p: number) => easeOut(arriving(p, first)) * (1 - leaving(p, lastCard));
  const opacity = useTransform(pos, (p) => shown(p));
  const transform = useTransform(pos, (p) => (still ? 'none' : `translate3d(0, ${((1 - easeOut(arriving(p, first))) * 0.12 - leaving(p, lastCard) * 0.12).toFixed(3)}em, 0)`));
  const filter = useTransform(pos, (p) => (still ? 'none' : `blur(${((1 - shown(p)) * 8).toFixed(2)}px)`));
  return (
    <motion.p
      style={{ opacity, transform, filter }}
      className="display col-start-1 row-start-1 text-[clamp(4.5rem,16vw,9rem)] leading-[0.85] text-accent-ink"
    >
      {year}
    </motion.p>
  );
}

/**
 * How it started, told one sentence at a time.
 *
 * The section is tall and its screen holds still (CSS sticky) while it is scrolled through. The
 * scroll plays the story like captions: first the title, then each sentence of 1936, 1953 and
 * 2021 in turn. A sentence arrives word by word, stays to be read, then dissolves and the next
 * one comes. The chapter's year sits above its sentences and changes with the chapter. The
 * scroll position goes through a light spring, so a mouse wheel's jumps read as one smooth pass.
 *
 * Screen readers get the whole story as plain text instead (the stage is hidden from them).
 * Under reduced motion the sentences still take turns, but simply appear and disappear, without
 * rising, blurring or word by word timing.
 */
export default function Story() {
  const section = useRef<HTMLElement>(null);
  const still = !!useReducedMotion();
  const span = last + 0.7;
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const raw = useTransform(scrollYProgress, (p) => p * span);
  const pos = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.5 });

  // The title card: there from the start, it dissolves like a sentence.
  const titleOpacity = useTransform(pos, (p) => 1 - leaving(p, 0));
  const titleTransform = useTransform(pos, (p) => (still ? 'none' : `translate3d(0, ${(-leaving(p, 0) * 0.15).toFixed(3)}em, 0)`));
  const titleFilter = useTransform(pos, (p) => (still ? 'none' : `blur(${(leaving(p, 0) * 8).toFixed(2)}px)`));

  return (
    <>
      <section
        ref={section}
        aria-labelledby="prica-naslov"
        className="relative isolate"
        style={{ height: `calc(100svh + ${span * STEP}svh)` }}
      >
        {/* For screen readers: the whole story, in order. */}
        <div className="sr-only">
          <h2 id="prica-naslov">{story.title}</h2>
          {story.chapters.map((c) => (
            <div key={c.year}>
              <h3>{c.year}.</h3>
              {c.beats.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
          ))}
        </div>

        <div aria-hidden className="sticky top-0 h-[100svh] overflow-hidden">
          <Streaks side="right" />

          {/* The title card. */}
          <motion.p
            style={{ opacity: titleOpacity, transform: titleTransform, filter: titleFilter }}
            className="display absolute inset-0 grid place-items-center px-6 text-center text-[clamp(3.5rem,13vw,9rem)]"
          >
            {story.title}
          </motion.p>

          {/* The year above, the sentence below; each stack keeps one spot whatever is showing. */}
          <div className="shell absolute inset-0 flex flex-col items-center justify-center gap-8 pt-16 md:gap-12">
            <div className="grid place-items-center">
              {story.chapters.map((c, i) => (
                <Year key={c.year} year={c.year} first={spans[i].first} lastCard={spans[i].last} pos={pos} still={still} />
              ))}
            </div>
            <div className="grid min-h-[10rem] place-items-center md:min-h-[12rem]">
              {cards.map((c, i) => (c.kind === 'beat' ? <Sentence key={i} text={c.text} card={i} pos={pos} still={still} /> : null))}
            </div>
          </div>
        </div>
      </section>

      <div className="shell pb-24 md:pb-32">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ytImage(bridgePhoto.id, bridgePhoto.frame)}
            alt={bridgePhoto.alt}
            width={1280}
            height={720}
            loading="lazy"
            className="aspect-[21/9] w-full rounded-[var(--radius)] object-cover"
          />
        </Reveal>
      </div>
    </>
  );
}
