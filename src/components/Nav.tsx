'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FacebookLogoIcon, InstagramLogoIcon, TiktokLogoIcon } from '@phosphor-icons/react';
import logo from '@/assets/logo.png';
import { nav, site, socials } from '@/content/site';

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
 * Right: the links as darker pills with white labels (.nav-pill) from 768px up,
 * the menu button below that. Name left and buttons right never share space.
 *
 * Below 768px the links live in a full-screen menu. It opens out of
 * the menu button: a blue circle that grows from the button until it covers
 * the screen, and the links rise in behind it. Closing runs the same circle
 * back into the button, faster.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

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
    const desktop = window.matchMedia('(min-width: 768px)');
    const onWide = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onWide);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onWide);
    };
  }, [open]);

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
            <div className="pointer-events-auto relative rounded-[1.875rem] bg-accent text-on-accent shadow-[0_18px_38px_-18px_rgb(0_25_40/0.75),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_25_40/0.25)]">

              {/* The left padding is the room the crest takes up. Below 360px the crest, the name and
                  the gap all tighten a little, so the menu button stays inside the bar. */}
              <div className="relative flex h-[3.75rem] items-center justify-between gap-4 pl-[7.5rem] pr-2 max-[359px]:gap-2 max-[359px]:pl-[6.5rem] lg:pl-[9.375rem]">
                <a
                  href="#top"
                  onClick={() => setOpen(false)}
                  aria-label={`${site.name}, na vrh stranice`}
                  className="display text-[0.95rem] leading-[0.9] max-[359px]:text-[0.85rem] lg:text-[1.05rem]"
                >
                  <span className="block text-white">{first}</span>
                  <span className="block text-deep">{rest.join(' ')}</span>
                </a>

                <nav aria-label="Glavna navigacija" className="hidden items-center gap-1.5 md:flex">
                  {nav.map((item) => (
                    <a key={item.href} href={item.href} className="nav-pill max-lg:px-3">
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="flex items-center md:hidden">
                  <button
                    ref={button}
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
                    className="nav-pill grid size-11 place-items-center p-0"
                  >
                    {/* Two bars that cross into an X. */}
                    <span aria-hidden className="relative block h-3 w-5">
                      <span
                        className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          open ? 'translate-y-[5px] rotate-45' : ''
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          open ? '-translate-y-[5px] -rotate-45' : ''
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* The crest. Same destination as the name beside it, so keyboard and screen readers skip it. */}
            <a
              href="#top"
              onClick={() => setOpen(false)}
              aria-hidden
              tabIndex={-1}
              className="pointer-events-auto absolute left-[2.75rem] top-[3.75rem] z-10 block -translate-y-1/2 rounded-full max-[359px]:left-[1.75rem] shadow-[0_10px_22px_-8px_rgb(0_25_40/0.6)] ring-[3px] ring-white transition-[scale] duration-200 ease-out hover:scale-105 active:scale-95 lg:left-[3.5rem]"
            >
              <Image src={logo} alt="" width={80} height={80} priority className="size-16 lg:size-20" />
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
            exit={reduce ? { opacity: 0 } : { clipPath: closed, transition: { duration: 0.5, ease: easeInOut } }}
            transition={reduce ? { duration: 0.2 } : { duration: 0.75, ease: easeInOut }}
            className="fixed inset-0 z-40 flex flex-col bg-accent text-on-accent md:hidden"
          >
            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: reduce ? 0 : 0.32 } } }}
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

              <motion.ul variants={rise} className="mt-auto flex gap-2 pt-10">
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
