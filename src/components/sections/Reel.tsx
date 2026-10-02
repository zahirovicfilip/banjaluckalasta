'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { finale } from '@/content/site';

/**
 * One vertical clip. The poster (a mid-flight frame) is a normal lazy image;
 * the video is only fetched when the card is on screen, plays while at least
 * 60% visible, and fades in over the poster. If autoplay is unavailable
 * (reduced motion, Low Power Mode) the card gets a play button instead.
 */
function Clip({ id, name, index }: { id: string; name?: string; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);
  const [manual, setManual] = useState(false);
  const [paused, setPaused] = useState(true);
  const label = `Skok ${index + 1}${name ? `, ${name}` : ''}`;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduce) {
      setManual(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          video.muted = true;
          video.play().catch(() => setManual(true));
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduce]);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  return (
    <li className="relative aspect-[9/16] w-[62vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[var(--radius)] bg-surface sm:w-[36vw] md:w-[24vw] lg:w-[19vw]">
      <Image
        src={`/media/skok-${id}.jpg`}
        alt={`${label}: skakač u letu sa tornja na jezeru Manjača`}
        fill
        sizes="(min-width: 1024px) 19vw, (min-width: 768px) 24vw, (min-width: 640px) 36vw, 62vw"
        className="object-cover"
      />
      <video
        ref={ref}
        src={`/media/skok-${id}.mp4`}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden
        tabIndex={-1}
        onPlaying={() => {
          setLive(true);
          setPaused(false);
        }}
        onPause={() => setPaused(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out ${live ? 'opacity-100' : 'opacity-0'}`}
      />
      {manual && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? `Pusti: ${label}` : `Pauziraj: ${label}`}
          className="group absolute inset-0 flex items-end p-4"
        >
          <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-150 ease-out group-active:scale-95">
            {paused ? <PlayIcon size={20} weight="fill" /> : <PauseIcon size={20} weight="fill" />}
          </span>
        </button>
      )}
    </li>
  );
}

/** Jump clips from the camp finale, as a rail that lines up with the page grid and bleeds off the right edge. */
export default function Reel() {
  const rail = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [edge, setEdge] = useState({ start: true, end: false });

  // First and last card tell us whether the rail can move further in each direction.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const first = el.firstElementChild;
    const last = el.lastElementChild;
    if (!first || !last) return;
    const io = new IntersectionObserver(
      (entries) => {
        setEdge((prev) => {
          const next = { ...prev };
          for (const e of entries) {
            if (e.target === first) next.start = e.intersectionRatio > 0.95;
            if (e.target === last) next.end = e.intersectionRatio > 0.95;
          }
          return next;
        });
      },
      { root: el, threshold: [0, 0.95, 1] },
    );
    io.observe(first);
    io.observe(last);
    return () => io.disconnect();
  }, []);

  function move(dir: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
  }

  const arrow =
    'grid size-12 place-items-center rounded-full border border-line text-ink transition-[transform,opacity,border-color] duration-150 ease-out hover:border-ink active:scale-95 disabled:pointer-events-none disabled:opacity-35';

  return (
    <div id="finale" className="border-t border-line py-24 md:py-32">
      <div className="shell flex items-end justify-between gap-8">
        <div>
          <h3 className="display text-[clamp(2.25rem,4.8vw,4.5rem)]">{finale.title}</h3>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">{finale.text}</p>
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label="Prethodni skokovi" className={arrow}>
            <ArrowLeftIcon size={20} weight="bold" />
          </button>
          <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label="Sljedeći skokovi" className={arrow}>
            <ArrowRightIcon size={20} weight="bold" />
          </button>
        </div>
      </div>

      <ul
        ref={rail}
        aria-label={finale.railLabel}
        tabIndex={0}
        className="rail no-scrollbar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain md:mt-16 md:gap-4"
      >
        {finale.clips.map((clip, i) => (
          <Clip key={clip.id} id={clip.id} name={clip.name} index={i} />
        ))}
      </ul>
    </div>
  );
}
