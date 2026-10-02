'use client';

import { useEffect, useRef } from 'react';
import { mountLasta, type LastaData, type LastaOptions } from './lasta-engine';
import rawData from './lasta-data.json';

const data = rawData as unknown as LastaData;

export type LastaHeroProps = LastaOptions & {
  /** Scroll distance the whole sequence takes, in viewport heights. Default 360. */
  length?: number;
  className?: string;
};

/**
 * Banjalučka lasta scroll hero.
 * The diver stands relaxed, jumps as the page scrolls, lands in the logo pose,
 * then the emblem draws itself around him. Transparent background, vector, no dependencies.
 * Place it anywhere; the stage pins to the viewport while the section scrolls past.
 */
export default function LastaHero({
  length = 360,
  className,
  fill = true,
  color,
  poseEnd,
  emblemAt,
  smoothing,
  label,
}: LastaHeroProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const instance = mountLasta(host, data, { fill, color, poseEnd, emblemAt, smoothing, label });
    return () => instance.destroy();
  }, [fill, color, poseEnd, emblemAt, smoothing, label]);

  return <section ref={ref} className={className} style={{ height: `${length}vh` }} />;
}
