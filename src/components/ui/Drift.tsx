'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

type DriftProps = {
  children: React.ReactNode;
  className?: string;
  /** Travel as a percentage of the element's own size, split around the centre of the viewport. */
  x?: number;
  y?: number;
};

/**
 * Moves its content along a short diagonal while the block crosses the viewport,
 * so a figure reads as travelling in the direction it faces. Static under reduced motion.
 */
export default function Drift({ children, className, x = 4, y = 6 }: DriftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const transform = useTransform(scrollYProgress, (p) =>
    reduce ? 'none' : `translate3d(${((0.5 - p) * 2 * x).toFixed(2)}%, ${((p - 0.5) * 2 * y).toFixed(2)}%, 0)`,
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ transform }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
