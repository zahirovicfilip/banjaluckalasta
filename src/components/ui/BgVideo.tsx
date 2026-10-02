'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

type BgVideoProps = {
  /** Landscape encode and its first frame. */
  wide: string;
  posterWide: string;
  /** Portrait encode and its first frame, used when the viewport is taller than wide. */
  tall: string;
  posterTall: string;
  /** Start slightly zoomed in and ease back to normal size as the block scrolls up to the top of the screen. */
  settle?: boolean;
  className?: string;
};

/**
 * Decorative background video. Nothing is downloaded until the block is near
 * the viewport; it plays only while visible and picks the encode that matches
 * the screen orientation. The poster is the video's own first frame, so the
 * handover is invisible. Under reduced motion (or if the browser refuses to
 * autoplay) the poster simply stays.
 *
 * With `settle` the picture arrives a little zoomed in and eases back to its
 * real size while the block travels from the bottom of the screen to the top.
 */
export default function BgVideo({ wide, posterWide, tall, posterTall, settle = false, className = '' }: BgVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(false);

  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'start start'] });
  const zoom = useTransform(scrollYProgress, (p) =>
    !settle || reduce ? 'none' : `scale(${(1.14 - 0.14 * Math.min(1, Math.max(0, p))).toFixed(4)})`,
  );

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
    <div ref={frame} aria-hidden className={`overflow-hidden ${className}`}>
      <motion.div style={{ transform: zoom }} className="absolute inset-0">
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
      </motion.div>
    </div>
  );
}
