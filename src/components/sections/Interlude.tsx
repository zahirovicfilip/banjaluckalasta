'use client';

import { useRef } from 'react';
import Streaks from '@/components/ui/Streaks';
import Image, { type StaticImageData } from 'next/image';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react';

export type Photo = {
  src: StaticImageData;
  alt: string;
  /** Centre of the photo across the screen, in % of the width. */
  x: number;
  /** Width in vw on phones and from 768px. */
  w: [number, number];
  /** 0 is far away (small, slow, dimmer, behind the words), 1 is close (big, fast, in front). */
  depth: number;
  /** When it passes the middle of the screen, as a share of the way through (0 to 1). */
  at: number;
  /** Its own lean, in degrees. */
  tilt: number;
  /** Width ÷ height of the crop, and which part of the picture to keep. */
  aspect?: number;
  focus?: string;
};

type InterludeProps = {
  line: string;
  photos: Photo[];
  /** Labels the section for screen readers. */
  label: string;
  /** Which screen edge the brochure streaks come in from. */
  streaks?: 'left' | 'right';
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Slow at first, then faster and faster: the way something falls. */
const fall = (p: number) => Math.pow(clamp(p, 0, 1), 1.45);

/**
 * A chapter break between two pages: a screen in the soft surface tone (light or dark with the
 * theme) that holds still while it
 * is scrolled through, with one line of words that never moves and photos
 * from the jumps falling past them, like the divers themselves.
 *
 * - The photos fall faster the further you scroll (gravity), and the close
 *   ones fall faster and bigger than the far ones (depth), and the far ones are fainter. The
 *   words stay on top of all of them, with a soft glow in the background colour.
 * - They follow the scroll through a spring, so they have weight: a flick
 *   carries them on a little after the scroll stops, and they settle.
 * - The faster they fall, the more they lean; they straighten as they slow.
 *
 * It arrives over the page before it with rounded top corners, like the camp
 * opener. The holding still is CSS (sticky). Under reduced motion nothing moves: the
 * photos sit still around the words.
 */
export default function Interlude({ line, photos, label, streaks = 'right' }: InterludeProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // From the moment the section's top enters the screen until its bottom leaves it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // The weight: the photos are pulled along by the scroll rather than glued to it.
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.9 });
  const speed = useVelocity(progress);
  // A lean in degrees from how fast they are falling, with a ceiling.
  const lean = useTransform(speed, (v) => clamp(v * 9, -7, 7));

  return (
    <section ref={ref} aria-label={label} className="relative z-10 -mt-9 h-[260svh] overflow-clip rounded-t-[2.25rem] bg-surface text-ink sm:-mt-12 sm:rounded-t-[3rem]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Streaks side={streaks} />
        {photos.map((photo, i) => (
          <Falling key={i} photo={photo} progress={progress} lean={lean} still={!!reduce} />
        ))}

        {/* The words: centred, still, and always on top, so the photos never cover them. */}
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center px-6">
          <div className="text-center">
            <p className="display max-w-[12ch] text-balance text-[clamp(3.5rem,17vw,12rem)] [text-shadow:0_2px_30px_var(--surface),0_0_2px_var(--surface)]">
              {line}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Falling({ photo, progress, lean, still }: { photo: Photo; progress: MotionValue<number>; lean: MotionValue<number>; still: boolean }) {
  const { depth, at } = photo;
  // How far it travels top to bottom over the whole section, in screen heights: the close
  // ones cover more ground in the same scroll, so they look faster.
  const travel = 1.6 + 2.2 * depth;
  const transform = useTransform([progress, lean], ([p, l]: number[]) => {
    const y = still ? (at - 0.5) * -60 : (fall(p) - fall(at)) * travel * 100;
    const x = still ? 0 : (fall(p) - fall(at)) * (photo.x < 50 ? -6 : 6) * depth;
    const r = photo.tilt + (still ? 0 : l * (0.4 + depth) * (photo.x < 50 ? -1 : 1));
    return `translate3d(calc(-50% + ${x.toFixed(2)}vw), calc(-50% + ${y.toFixed(2)}svh), 0) rotate(${r.toFixed(2)}deg)`;
  });

  const aspect = photo.aspect ?? 4 / 5;
  const near = depth >= 0.75;

  return (
    <motion.div
      style={{
        transform,
        left: `${photo.x}%`,
        ['--wm' as string]: photo.w[0],
        ['--wd' as string]: photo.w[1],
        aspectRatio: aspect,
        // Far photos recede by fading into the background, which reads right in both themes.
        opacity: +(0.5 + 0.5 * depth).toFixed(2),
      }}
      className={`absolute top-1/2 w-[calc(var(--wm)*1vw)] overflow-hidden rounded-[var(--radius)] will-change-transform md:w-[calc(var(--wd)*1vw)] ${
        near ? 'z-20 shadow-[0_50px_90px_-30px_rgb(0_0_0/0.75)]' : 'z-0 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]'
      }`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        placeholder="blur"
        sizes={`(min-width: 768px) ${photo.w[1]}vw, ${photo.w[0]}vw`}
        className="object-cover"
        style={{ objectPosition: photo.focus ?? '50% 45%' }}
      />
    </motion.div>
  );
}
