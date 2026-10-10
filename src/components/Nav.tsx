'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { FacebookLogoIcon, InstagramLogoIcon, TiktokLogoIcon } from '@phosphor-icons/react';
import logo from '@/assets/logo.png';
import airsoftLogo from '@/assets/airsoft/logo.jpg';
import { airsoft, nav, site, socials } from '@/content/site';
import ThemeSwitch from '@/components/ThemeSwitch';

const socialIcons = { instagram: InstagramLogoIcon, tiktok: TiktokLogoIcon, facebook: FacebookLogoIcon };
const easeOut = [0.16, 1, 0.3, 1] as const;
// For the menu circle: slow off the button, fast across the screen, soft landing.
const easeInOut = [0.77, 0, 0.175, 1] as const;

/**
 * A floating bar in the same pill shape as the buttons, in the flat brand blue.
 *
 * Left: the crest and the name. The crest is not inside the bar: it hangs off
 * its bottom edge, half on the bar and half over the page. The name beside it
 * is the hero title in miniature, same font, two lines, two tones.
 * Right: the links as darker pills with white labels (.nav-pill) from 1024px up,
 * the menu button below that. Name left and buttons right never share space.
 *
 * Below 1024px the links live in a full-screen menu, and on desktop too once the
 * visitor is past the camp programme and scrolling on (see `compact`). It opens out of
 * the menu button: a blue circle that grows from the button until it covers
 * the screen, and the links rise in behind it. Closing runs the same circle
 * back into the button, faster.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  // Desktop only: once the camp programme is behind the visitor, the links fold into the
  // menu button while they scroll on, and come back as soon as they scroll up a little.
  // (Below 1024px the menu button is always there and nothing changes.)
  const [compact, setCompact] = useState(false);
  const last = useRef(0);
  const climb = useRef(0);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const dy = y - last.current;
    last.current = y;
    climb.current = dy < 0 ? climb.current - dy : 0;
    const program = document.getElementById('program');
    const past = !!program && program.getBoundingClientRect().bottom < 88;
    setCompact((was) => {
      if (!past) return false;
      if (dy > 0) return true;
      // A deliberate scroll up, not a trackpad's twitch.
      if (climb.current > 24) return false;
      return was;
    });
  });
  const compactRef = useRef(compact);
  compactRef.current = compact;

  function toggle() {
    if (!open && button.current) {
      // The circle starts at the centre of the button and has to reach the farthest corner.
      const box = button.current.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      setOrigin({ x, y, r: Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 24 });
    }
    setOpen((v) => !v);
  }

  // While the menu is open: the page behind does not scroll, Escape closes it,
  // and it closes itself if the window grows to desktop width.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    // On desktop the menu only exists while the links are folded away.
    const onWide = () => {
      if (desktop.matches && !compactRef.current) setOpen(false);
    };
    onWide();
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onWide);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onWide);
    };
  }, [open, compact]);

  const closed = `circle(22px at ${origin.x}px ${origin.y}px)`;
  const flooded = `circle(${origin.r}px at ${origin.x}px ${origin.y}px)`;
  const [first, ...rest] = site.name.split(' ');
  const rise = {
    hidden: { opacity: 0, transform: `translateY(${reduce ? 0 : 24}px)` },
    show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.55, ease: easeOut } },
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
        <div className="shell">
          <div className="relative">
            {/* Flat blue, with a hairline of light on top and shade below so it reads as a solid bar. */}
            <div data-navbar className="pointer-events-auto relative rounded-[1.875rem] bg-accent text-on-accent shadow-[0_18px_38px_-18px_rgb(0_25_40/0.75),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_25_40/0.25)]">

              {/* The left padding is the room the crest takes up. Below 360px the crest, the name and
                  the gap all tighten a little, so the menu button stays inside the bar. */}
              <div className="relative flex h-[3.75rem] items-center justify-between gap-4 pl-[7.5rem] pr-2 max-[359px]:gap-2 max-[359px]:pl-[6.5rem] lg:pl-[9.375rem]">
                <a
                  href="/#top"
                  onClick={() => setOpen(false)}
                  aria-label={`${site.name}, na vrh stranice`}
                  data-wordmark
                  // While the camp badge sits in the bar (CampStage), it takes this name's place. The
                  // name steps aside quickly; coming back it fades in where it stands, slightly after
                  // the badge starts to leave, so the two overlap into one crossfade, not a swap.
                  className="display relative text-[1.4rem] leading-[0.85] transition-[opacity,filter] delay-[150ms] duration-[600ms] ease-[cubic-bezier(0.77,0,0.175,1)] max-[359px]:text-[1.2rem] lg:text-[1.6rem] [html[data-camp-badge]_&]:opacity-0 [html[data-camp-badge]_&]:blur-[2px] [html[data-camp-badge]_&]:delay-0 [html[data-camp-badge]_&]:duration-200"
                >
                  {/* While the airsoft section is on screen (Airsoft.tsx sets <html data-airsoft>) the
                      name swaps for the airsoft club's, in the same lockup, as a crossfade in place.
                      The airsoft name takes no room of its own, so the bar's layout never changes. */}
                  <span className="block transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [html[data-airsoft]_&]:opacity-0 [html[data-airsoft]_&]:blur-[2px]">
                    <span className="block text-white">{first}</span>
                    <span className="block text-deep">{rest.join(' ')}</span>
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.82em] opacity-0 blur-[2px] transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [html[data-airsoft]_&]:opacity-100 [html[data-airsoft]_&]:blur-none"
                  >
                    <span className="block text-white">{airsoft.navName[0]}</span>
                    <span className="block text-deep">{airsoft.navName[1]}</span>
                  </span>
                </a>

                {/*
                  The links and the menu button share one spot on the right. From 1024px the links
                  show and the button hides, until `compact`: then the links fold away into the
                  button, the one nearest it first, and the button comes up in their place.
                  CSS transitions, so a quick change of mind reverses smoothly from wherever it is.
                */}
                <div className="grid items-center justify-items-end">
                  <nav
                    aria-label="Glavna navigacija"
                    aria-hidden={compact || undefined}
                    inert={compact}
                    className="col-start-1 row-start-1 hidden items-center gap-1.5 lg:flex"
                  >
                    {nav.map((item, i) => (
                      <a
                        key={item.href}
                        href={item.href}
                        style={{ transitionDelay: `${(nav.length - 1 - i) * 35}ms` }}
                        className={`nav-pill transition-[opacity,transform] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transform-none ${
                          compact ? 'pointer-events-none translate-x-4 scale-90 opacity-0' : ''
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>

                  <div
                    className={`col-start-1 row-start-1 flex items-center transition-[opacity,transform] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transform-none ${
                      compact ? 'lg:delay-100' : 'lg:pointer-events-none lg:scale-90 lg:opacity-0'
                    }`}
                  >
                    <button
                      ref={button}
                      type="button"
                      onClick={toggle}
                      aria-expanded={open}
                      aria-controls="mobile-menu"
                      aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
                      className={`nav-pill grid size-11 place-items-center p-0 ${compact ? '' : 'lg:invisible'}`}
                    >
                      {/* Two bars that cross into an X. */}
                      <span aria-hidden className="relative block h-3 w-5">
                        <span
                          className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
                            open ? 'translate-y-[5px] rotate-45' : ''
                          }`}
                        />
                        <span
                          className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
                            open ? '-translate-y-[5px] -rotate-45' : ''
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* The crest. Same destination as the name beside it, so keyboard and screen readers skip it. */}
            <a
              href="/#top"
              onClick={() => setOpen(false)}
              aria-hidden
              tabIndex={-1}
              className="pointer-events-auto absolute left-[2.75rem] top-[3.75rem] z-10 block -translate-y-1/2 rounded-full max-[359px]:left-[1.75rem] shadow-[0_10px_22px_-8px_rgb(0_25_40/0.6)] ring-[3px] ring-white transition-[scale] duration-150 ease-[var(--ease-out-expo)] hover:scale-105 active:scale-95 lg:left-[3.5rem]"
            >
              <Image
                src={logo}
                alt=""
                width={80}
                height={80}
                priority
                className="size-16 rounded-full transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] lg:size-20 [html[data-airsoft]_&]:opacity-0 [html[data-airsoft]_&]:blur-[2px]"
              />
              {/* The airsoft club's emblem takes the crest's place with the name (see above). */}
              <Image
                src={airsoftLogo}
                alt=""
                width={80}
                height={80}
                className="absolute inset-0 size-16 rounded-full opacity-0 blur-[2px] transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] lg:size-20 [html[data-airsoft]_&]:opacity-100 [html[data-airsoft]_&]:blur-none"
              />
            </a>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobilna navigacija"
            initial={reduce ? { opacity: 0 } : { clipPath: closed }}
            animate={reduce ? { opacity: 1 } : { clipPath: flooded }}
            exit={reduce ? { opacity: 0 } : { clipPath: closed, transition: { duration: 0.3, ease: easeInOut } }}
            transition={reduce ? { duration: 0.2 } : { duration: 0.45, ease: easeInOut }}
            className={`fixed inset-0 z-40 flex flex-col bg-accent text-on-accent ${compact ? '' : 'lg:hidden'}`}
          >
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: reduce ? 0 : 0.18 } } }}
              initial="hidden"
              animate="show"
              className="shell relative flex flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-[calc(env(safe-area-inset-top,0px)+8.75rem)]"
            >
              <ul className="grid gap-1">
                {nav.map((item) => (
                  <motion.li key={item.href} variants={rise}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="display block py-2 text-[clamp(2.4rem,11.5vw,4rem)] transition-[scale] duration-150 ease-out active:scale-[0.98]"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Light, dark or the device's setting (the default). */}
              <motion.div variants={rise} className="mt-auto pt-10">
                <ThemeSwitch />
              </motion.div>

              <motion.ul variants={rise} className="mt-4 flex gap-2">
                {socials.map((s) => {
                  const Icon = socialIcons[s.id];
                  return (
                    <li key={s.id}>
                      <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="nav-pill grid size-12 place-items-center p-0">
                        <Icon size={22} />
                      </a>
                    </li>
                  );
                })}
              </motion.ul>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
