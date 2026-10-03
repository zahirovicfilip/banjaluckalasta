'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

/** How long a finger has to stay on the diver before the game opens, in ms. */
const HOLD_MS = 550;

/**
 * The hidden way into the game: an invisible button over the diver in the hero.
 * With a mouse (or the keyboard) a click opens /skok. On a touch screen a tap
 * does nothing, so scrolling past him stays safe; holding him for about half a
 * second opens it, and he swells a little while the finger is down.
 *
 * Only the diver's body is clickable, not the empty corners of his picture: the
 * button is clipped to a band along the body, from the head at the lower left
 * to the feet at the upper right.
 */
export default function SkokTrigger({ onHold }: { onHold: (holding: boolean) => void }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const touch = useRef(false);

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
    onHold(false);
  }

  return (
    <button
      type="button"
      aria-label="Skrivena igra: skoči lastu"
      onPointerDown={(e) => {
        touch.current = e.pointerType !== 'mouse';
        if (!touch.current) return;
        start.current = { x: e.clientX, y: e.clientY };
        onHold(true);
        timer.current = setTimeout(() => {
          onHold(false);
          router.push('/skok');
        }, HOLD_MS);
      }}
      onPointerMove={(e) => {
        // A finger that moves is scrolling, not holding.
        const s = start.current;
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) cancel();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        // Touch taps are handled by the hold above; a click here is a mouse or the keyboard.
        if (!touch.current) router.push('/skok');
        touch.current = false;
      }}
      className="pointer-events-auto absolute inset-0 cursor-pointer select-none rounded-none [-webkit-touch-callout:none] [clip-path:polygon(2%_74%,14%_55%,34%_50%,48%_22%,68%_18%,84%_0%,100%_0%,100%_13%,80%_29%,66%_68%,46%_93%,15%_100%,2%_97%)] focus-visible:[clip-path:none] focus-visible:outline-offset-[-4px]"
    />
  );
}
