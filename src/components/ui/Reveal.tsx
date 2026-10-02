'use client';

import { motion, useReducedMotion } from 'motion/react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'article';
};

/**
 * Fades content up once as it enters the viewport. Uses a full transform
 * string so the browser can run it off the main thread while videos load.
 * Under reduced motion it only fades.
 */
export default function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, transform: `translateY(${reduce ? 0 : y}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduce ? 0.3 : 0.8, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
