'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';

type BgVideoProps = {
  /** Landscape encode and its first frame. */
  wide: string;
  posterWide: string;
  /** Portrait encode and its first frame, used when the viewport is taller than wide. */
  tall: string;
  posterTall: string;
  className?: string;
};

/**
 * Decorative background video. Nothing is downloaded until the block is near
 * the viewport; it plays only while visible and picks the encode that matches
 * the screen orientation. The poster is the video's own first frame, so the
 * handover is invisible. Under reduced motion (or if the browser refuses to
 * autoplay) the poster simply stays.
 */
export default function BgVideo({ wide, posterWide, tall, posterTall, className = '' }: BgVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce) return;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            video.src = window.matchMedia('(min-aspect-ratio: 1/1)').matches ? wide : tall;
          }
          video.muted = true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduce, wide, tall]);

  return (
    <div aria-hidden className={`overflow-hidden ${className}`}>
      <Image src={posterWide} alt="" fill sizes="100vw" className="hidden object-cover landscape:block" />
      <Image src={posterTall} alt="" fill sizes="100vw" className="object-cover landscape:hidden" />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
        onPlaying={() => setLive(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${live ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
