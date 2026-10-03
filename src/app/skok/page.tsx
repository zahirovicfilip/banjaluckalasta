import type { Metadata } from 'next';
import Game from '@/components/skok/Game';

/**
 * The hidden game. Not in the navigation: it opens from the diver in the hero
 * (click him on a computer, press and hold him on a phone).
 */
export const metadata: Metadata = {
  title: 'Skok laste',
  description: 'Mala igra: skoči banjalučku lastu u pravom trenutku.',
  robots: { index: false },
};

export default function SkokPage() {
  return <Game />;
}
