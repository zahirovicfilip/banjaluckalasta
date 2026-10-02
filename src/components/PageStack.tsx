'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';

type Page = { id: string; node: React.ReactNode };

type PageStackProps = {
  /** The pages that stay in place while the next one slides over them, in order. */
  pages: [Page, Page];
  /** Everything after them. Its first section is the sheet that covers the second page. */
  children: React.ReactNode;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The first screens of the site behave like a stack of pages. Each page holds
 * still while the next one slides up over it as a rounded sheet, and the page
 * underneath shrinks back and fades as it is covered.
 *
 * Holding still is plain CSS (`position: sticky`, see `.stack-page`), so it
 * stays smooth on phones. Only the shrink and fade follow the scroll position
 * from JavaScript.
 *
 * The anchors (#top, #istorija) are empty elements in front of the pages, not
 * the pages themselves: a pinned page reports its pinned position, so a link
 * to it from further down would not scroll anywhere.
 *
 * Under reduced motion nothing is pinned or scaled and the page scrolls as a
 * normal document.
 */
export default function PageStack({ pages, children }: PageStackProps) {
  const [first, second] = pages;
  const secondAnchor = useRef<HTMLDivElement>(null);
  const rest = useRef<HTMLDivElement>(null);
  const firstCovered = useCover(secondAnchor);
  const secondCovered = useCover(rest);

  return (
    <>
      <div id={first.id} />
      <Pinned covered={firstCovered} className="z-0">
        {first.node}
      </Pinned>

      {/* The negative scroll margin cancels the page's 88px anchor offset, so the link lands
          with this page covering the screen instead of 88px short of it. */}
      <div ref={secondAnchor} id={second.id} className="-scroll-mt-[88px]" />
      <Pinned covered={secondCovered} rising={firstCovered} className="z-10 rounded-t-[2.25rem] bg-bg sm:rounded-t-[3rem]">
        {second.node}
      </Pinned>

      <div ref={rest} className="relative isolate z-20">
        {/* Opaque floor for the sections that have no background of their own, so the pinned
            pages never show through. It starts below the first section's rounded corners. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-16 -z-10 bg-bg" />
        {children}
      </div>
    </>
  );
}

/** 0 while `target` is still below the screen, 1 once its top edge has reached the top. */
function useCover(target: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'start start'] });
  return scrollYProgress;
}

type PinnedProps = {
  /** How far the next page has covered this one, 0 to 1. */
  covered: MotionValue<number>;
  /** For a sheet: how far it has come up over the page before it, 0 to 1. */
  rising?: MotionValue<number>;
  className?: string;
  children: React.ReactNode;
};

function Pinned({ covered, rising, className = '', children }: PinnedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The sheet's edge line and shadow fade in as it starts to rise, so nothing of them
  // shows along the bottom of the screen while it is still waiting below.
  const edge = useTransform(rising ?? covered, (p) => (rising && !reduce ? clamp01(p * 8) : 0));

  // A page taller than the screen pins at its bottom edge instead of its top, so all of it
  // can be read before it is covered. The CSS needs the page height for that.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => el.style.setProperty('--page-h', `${el.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const transform = useTransform(covered, (p) => (reduce || p <= 0 ? 'none' : `scale(${(1 - 0.06 * clamp01(p)).toFixed(4)})`));
  const opacity = useTransform(covered, (p) => (reduce ? 1 : 1 - clamp01(p) ** 2));
  // Fully covered pages stop painting (and their links leave the tab order).
  const visibility = useTransform(covered, (p) => (!reduce && p >= 1 ? 'hidden' : 'visible'));

  return (
    <motion.div ref={ref} style={{ transform, opacity, visibility }} className={`stack-page relative isolate origin-top ${className}`}>
      {rising && (
        <motion.span
          aria-hidden
          style={{ opacity: edge }}
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 rounded-t-[inherit] shadow-[0_-1px_0_var(--line),0_-26px_60px_-30px_rgb(0_25_40/0.45)]"
        />
      )}
      {children}
    </motion.div>
  );
}
