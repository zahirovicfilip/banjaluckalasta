import dynamic from 'next/dynamic';
import HeroPoster from '@/components/sections/HeroPoster';
import { hero } from '@/content/site';

// Loaded on demand, so the dive's geometry (135 KB) is not shipped while it is hidden.
const HeroDive = dynamic(() => import('@/components/sections/HeroDive'));

/** `hero.animated` in src/content/site.ts picks between the scroll-driven dive and the poster hero. */
export default function Hero() {
  return hero.animated ? <HeroDive /> : <HeroPoster />;
}
