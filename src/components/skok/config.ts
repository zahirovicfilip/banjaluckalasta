/**
 * Every number that decides how the game feels, in one place.
 *
 * Heights are in metres and times in milliseconds or seconds as named. The fall
 * itself is real physics: from height h the diver hits the water after
 * sqrt(2h/g) seconds at sqrt(2gh) m/s, so a higher platform both lasts longer
 * and arrives faster.
 *
 * The timing window is measured in time before impact. A tap is clean when the
 * time left until the water is between `closeMs` (the arms need that long to
 * come together) and `closeMs + window`. Earlier is "too early", later or never
 * is "too late". The middle of the window is the perfect moment.
 */
export const config = {
  /** m/s². Real gravity. */
  gravity: 9.81,
  /** Plays the whole fall slower than real time (1 = real time). Below 1 makes every level easier. */
  timeScale: 0.85,

  /** Platform height on level 1, in metres. */
  startHeight: 8,
  /** Added on every level, in metres. */
  heightStep: 2.5,
  /** The platform never grows past this, in metres; levels after that only shrink the window. */
  maxHeight: 40,

  /** The timing window on level 1, in ms of time-before-impact. */
  windowMs: 280,
  /** Each level multiplies the window by this (0.88 = 12% smaller every level). */
  windowShrink: 0.88,
  /** The window never gets smaller than this, in ms. */
  minWindowMs: 60,
  /** How long the arms take to come together over the head, in ms. Taps with less time left are late. */
  closeMs: 120,

  /** Points for a clean dive, and the most a perfectly centred tap adds on top. */
  cleanPoints: 100,
  perfectBonus: 100,
  /** A tap within this share of the window's half-width from its centre counts as "Savršeno". */
  perfectZone: 0.25,

  /** The jump off the platform: a small hop up and forward, in m/s. */
  jumpUp: 1.6,
  jumpForward: 1.3,

  /** How many metres of height the screen shows on level 1, and how much more per level (zoom out). */
  viewMetres: 13,
  viewPerLevel: 0.9,
  viewMaxMetres: 30,

  /** Scene pacing, in ms (shortened under reduced motion). */
  climbMs: 1300,
  poseMs: 700,
  resultMs: 1700,

  /** localStorage key for the best result. Nothing is ever sent anywhere. */
  storageKey: 'banjalucka-lasta-skok-best',

  colors: {
    water: '#12403f',
    waterLight: '#1d5c5a',
    sky: '#f3f4f1',
    ink: '#14201f',
    accent: '#b4372b',
    stone: '#c9cbc4',
    stoneDark: '#9fa39a',
    foam: '#ffffff',
  },
} as const;

export type Config = typeof config;

/** Platform height for a level (1-based), in metres. */
export const heightFor = (level: number) => Math.min(config.maxHeight, config.startHeight + (level - 1) * config.heightStep);

/** Timing window for a level (1-based), in ms. */
export const windowFor = (level: number) => Math.max(config.minWindowMs, config.windowMs * config.windowShrink ** (level - 1));
