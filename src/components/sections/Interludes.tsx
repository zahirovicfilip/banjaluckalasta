import Interlude, { type Photo } from '@/components/sections/Interlude';
import fontana from '@/assets/interlude/fontana.jpg';
import iznadKajaka from '@/assets/interlude/iznad-kajaka.jpg';
import kajaci from '@/assets/interlude/kajaci.jpg';
import lastaGomila from '@/assets/interlude/lasta-gomila.jpg';
import lastaNebo from '@/assets/interlude/lasta-nebo.jpg';
import lastaObala from '@/assets/interlude/lasta-obala.jpg';
import letSlika from '@/assets/interlude/let.jpg';
import navijaci from '@/assets/interlude/navijaci.jpg';
import odraz from '@/assets/interlude/odraz.jpg';
import pljusak from '@/assets/interlude/pljusak.jpg';
import prskanjeObala from '@/assets/interlude/prskanje-obala.jpg';
import prskanje from '@/assets/interlude/prskanje.jpg';
import silueta from '@/assets/interlude/silueta.jpg';
import toranj from '@/assets/interlude/toranj.jpg';
import ulazak from '@/assets/interlude/ulazak.jpg';
import vrhTornja from '@/assets/interlude/vrh-tornja.jpg';
import { interludes } from '@/content/site';

/*
 * The stills are frames from the club's jump clips (the Skokovi folder of the club's transfer), taken at full size
 * with the media tool (scripts/media). Left and right alternate, near and far alternate, and each one
 * passes the middle of the screen at its own moment, so two or three are always in view.
 */

const lasta: Photo[] = [
  { src: silueta, alt: 'Skakač u letu, silueta na nebu', x: 76, w: [32, 13], depth: 0.35, at: 0.22, tilt: 6 },
  { src: lastaGomila, alt: 'Lasta iznad publike na obali', x: 24, w: [50, 22], depth: 0.95, at: 0.32, tilt: -5 },
  { src: letSlika, alt: 'Skakač u letu pored tornja', x: 50, w: [30, 12], depth: 0.25, at: 0.4, tilt: 2, focus: '45% 42%' },
  { src: lastaNebo, alt: 'Lasta na plavom nebu', x: 76, w: [46, 20], depth: 0.85, at: 0.48, tilt: 4 },
  { src: odraz, alt: 'Odraz sa platforme tornja', x: 22, w: [30, 12], depth: 0.3, at: 0.56, tilt: -3, focus: '40% 40%' },
  { src: ulazak, alt: 'Skakač pred ulazak u vodu, publika na obali', x: 80, w: [34, 15], depth: 0.5, at: 0.64, tilt: 5, focus: '50% 40%' },
  { src: prskanje, alt: 'Ulazak u vodu uz veliki pljusak', x: 26, w: [46, 19], depth: 0.8, at: 0.72, tilt: -4, focus: '50% 58%' },
  { src: lastaObala, alt: 'Skakač iznad obale jezera', x: 74, w: [32, 14], depth: 0.45, at: 0.82, tilt: 3 },
];

const kamp: Photo[] = [
  { src: vrhTornja, alt: 'Skakač na vrhu tornja', x: 70, w: [30, 12], depth: 0.3, at: 0.22, tilt: 3, focus: '50% 35%' },
  { src: toranj, alt: 'Toranj za skokove na obali jezera Manjača', x: 24, w: [44, 18], depth: 0.7, at: 0.3, tilt: -4 },
  { src: navijaci, alt: 'Publika na obali bodri skakače', x: 76, w: [50, 22], depth: 0.95, at: 0.4, tilt: 5, focus: '60% 45%' },
  { src: pljusak, alt: 'Pljusak na mirnom jezeru', x: 48, w: [30, 12], depth: 0.25, at: 0.47, tilt: -2, focus: '50% 55%' },
  { src: kajaci, alt: 'Skok pored kajaka na jezeru', x: 26, w: [48, 20], depth: 0.85, at: 0.55, tilt: -3, focus: '50% 62%' },
  { src: iznadKajaka, alt: 'Skakač iznad kajakaša na jezeru', x: 78, w: [34, 15], depth: 0.5, at: 0.63, tilt: 4, focus: '50% 45%' },
  { src: fontana, alt: 'Pljusak vode poslije skoka', x: 22, w: [36, 15], depth: 0.55, at: 0.72, tilt: -4, focus: '45% 50%' },
  { src: prskanjeObala, alt: 'Pljusak pred punom obalom', x: 76, w: [32, 13], depth: 0.4, at: 0.82, tilt: -5, focus: '50% 55%' },
];

export function LastaInterlude() {
  return <Interlude {...interludes.lasta} photos={lasta} streaks="left" />;
}

export function KampInterlude() {
  return <Interlude {...interludes.kamp} photos={kamp} />;
}
