'use client';

import { useState } from 'react';
import { PlayIcon } from '@phosphor-icons/react';
import { ytImage, type YtFrame } from '@/lib/youtube';

type YouTubeProps = {
  id: string;
  title: string;
  frame?: YtFrame;
  className?: string;
  /** Only render the poster, never swap in the player (for use as a photo). */
  posterOnly?: boolean;
};

/** Lightweight YouTube facade: real poster first, iframe (youtube-nocookie) only after a click. */
export default function YouTube({ id, title, frame = 'maxresdefault', className = '', posterOnly = false }: YouTubeProps) {
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(ytImage(id, frame));
  // hqdefault is 4:3 with black bars baked in above and below a 16:9 picture
  const letterboxed = src.endsWith('/hqdefault.jpg');

  if (playing) {
    return (
      <div className={`relative overflow-hidden rounded-[var(--radius)] bg-ink ${className}`}>
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const poster = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={posterOnly ? title : ''}
      loading="lazy"
      // YouTube answers a missing HD frame with a 120px grey placeholder
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 120) setSrc(ytImage(id, 'hqdefault'));
      }}
      style={letterboxed ? { transform: 'scale(1.34)' } : undefined}
      className="absolute inset-0 size-full object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
    />
  );

  if (posterOnly) {
    return <div className={`group relative overflow-hidden rounded-[var(--radius)] bg-surface ${className}`}>{poster}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Pusti video: ${title}`}
      className={`group relative block overflow-hidden rounded-[var(--radius)] bg-surface text-left ${className}`}
    >
      {poster}
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-4 left-4 grid size-14 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-300 group-hover:scale-110 group-active:scale-95 md:bottom-6 md:left-6">
        <PlayIcon size={22} weight="fill" />
      </span>
    </button>
  );
}
