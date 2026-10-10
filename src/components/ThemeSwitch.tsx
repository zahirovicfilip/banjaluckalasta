'use client';

import { useEffect, useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CircleHalfIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { THEME_BAR as BAR, THEME_KEY } from '@/lib/theme';

export type Theme = 'auto' | 'light' | 'dark';

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  // The two theme-color tags follow the device by default; a fixed choice paints both.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const media = m.getAttribute('media') ?? '';
    m.content = theme === 'auto' ? (media.includes('dark') ? BAR.dark : BAR.light) : BAR[theme];
  });
}

const options: { id: Theme; label: string; Icon: typeof SunIcon }[] = [
  { id: 'auto', label: 'Kao uređaj', Icon: CircleHalfIcon },
  { id: 'light', label: 'Svijetla', Icon: SunIcon },
  { id: 'dark', label: 'Tamna', Icon: MoonIcon },
];

/**
 * Light, dark, or whatever the device says (the default). It sits in the menu. The choice is
 * remembered in this browser; "Kao uređaj" forgets it again. Colours switch at once (it is a
 * setting, and the page behind is already changing), only the highlight slides.
 */
export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('auto');
  const reduce = useReducedMotion();
  const uid = useId();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        apply(saved); // the attribute is already set before paint; this also colours the browser bar
      }
    } catch {
      // Storage blocked (private mode): the device setting it is.
    }
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    apply(next);
    try {
      if (next === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not remembered, but still applied for this visit.
    }
  }

  return (
    <div role="radiogroup" aria-label="Tema" className="inline-grid grid-cols-3 gap-1 rounded-full bg-deep/15 p-1">
      {options.map(({ id, label, Icon }) => {
        const on = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => choose(id)}
            className={`relative flex items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-[color,transform] duration-150 ease-out active:scale-[0.96] ${
              on ? 'text-deep' : 'text-on-accent/80 pointer-fine:hover:text-on-accent'
            }`}
          >
            {on && (
              <motion.span
                layoutId={`${uid}-tema`}
                aria-hidden
                className="absolute inset-0 rounded-full bg-white"
                transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }}
              />
            )}
            <Icon size={18} weight="bold" className="relative" />
            <span className="relative whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
