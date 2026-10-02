# LastaHero

Scroll-driven hero for Udruženje Banjalučka lasta. The diver stands relaxed (with a slight idle breath), jumps as the page scrolls, lands in the exact logo pose, and the emblem then draws itself around him. Transparent background, vector, no dependencies.

## Install

Copy this folder into your Next.js project, for example `components/lasta/`.

```tsx
import LastaHero from '@/components/lasta/LastaHero';

export default function Page() {
  return (
    <>
      <LastaHero />
      <section>{/* rest of the page */}</section>
    </>
  );
}
```

The section is 360vh tall. Its stage pins to the viewport while the section scrolls past, so the animation plays over that distance and reverses when scrolling back up.

## Props

| Prop | Default | What it does |
| --- | --- | --- |
| `length` | `360` | Scroll distance of the sequence, in viewport heights |
| `fill` | `true` | White inner fill of the emblem, like the printed logo. `false` keeps only the blue parts |
| `color` | `#3673B3` | Brand blue |
| `poseEnd` | `0.86` | Scroll progress (0–1) where he lands in the logo pose |
| `emblemAt` | `0.83` | Scroll progress where the emblem draws in |
| `smoothing` | `7` | Scroll smoothing. Higher follows the scrollbar more tightly |
| `label` | `Бањалучка ласта — удружење` | Accessible name of the graphic |

## Notes

- Nothing is painted behind the stage, so your page background shows through.
- JSON import needs `resolveJsonModule`, which Next.js enables by default.
- With `prefers-reduced-motion: reduce` there is no jump: the standing figure crossfades to the logo pose and the emblem fades in.
- Size: engine about 4 KB gzipped, geometry data 135 KB (about 55 KB gzipped).
