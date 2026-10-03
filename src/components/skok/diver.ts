/**
 * The diver is the man from the club's logo: the same outline the original hero
 * animation uses (src/components/lasta/lasta-data.json), a vector silhouette
 * skinned to ten bones. That data already holds his relaxed stance, the crouch
 * and launch of a jump, and, at its end, the exact logo pose, which is the
 * swallow (lasta) itself. The other poses the game needs (arms together over
 * the head for the entry, a tumble, a flat slap, floating) are the logo pose
 * with some joints turned further.
 *
 * Poses are arrays of the rig's channels, in degrees. This file only reads the
 * shared data; the hero's own engine is not touched.
 */
import raw from '@/components/lasta/lasta-data.json';

type RigData = {
  bones: string[];
  parent: number[];
  pivot: number[][];
  chan: string[];
  joints: { pos: number[][]; parent: number[] };
  shapes: { pts: number[]; base: number[]; inf: number[][] }[];
  channels: { dt: number; T: number; names: string[]; data: number[][] };
};

const data = raw as unknown as RigData;
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const names = data.channels.names;
const ci: Record<string, number> = {};
names.forEach((n, i) => (ci[n] = i));

/** One value per rig channel (dx, dy, root, hip, knee, ankle, s1, s2, neck, armL, elbowL, armS). */
export type Pose = Float64Array;
type Mods = Partial<Record<'root' | 'hip' | 'knee' | 'ankle' | 's1' | 's2' | 'neck' | 'armL' | 'elbowL' | 'armS', number>>;

/** The rig's own animation at time t (0 = standing, T = the logo pose). */
export function sample(t: number): Pose {
  const ch = data.channels;
  const n = ch.data[0].length;
  const u = Math.min(n - 1, Math.max(0, t / ch.dt));
  const i = Math.min(n - 2, Math.floor(u));
  const f = u - i;
  const p = new Float64Array(names.length);
  for (let k = 0; k < names.length; k++) {
    const a = ch.data[k];
    p[k] = a[i] + (a[i + 1] - a[i]) * f;
  }
  return p;
}

export const ANIM_T = data.channels.T;
/** In the rig's animation: crouched with the arms swung back, and leaving the platform. */
export const CROUCH_T = 0.6;
export const LAUNCH_T = 1.2;

function withMods(base: Pose, mods: Mods): Pose {
  const p = Float64Array.from(base);
  for (const [k, v] of Object.entries(mods)) p[ci[k]] += v as number;
  return p;
}

const logo = sample(ANIM_T);
const stance = sample(0);

export const poses = {
  stance,
  /** On the ladder, two alternating holds. */
  climbA: withMods(stance, { armL: 170, armS: 120, elbowL: 30, hip: -40, knee: 60 }),
  climbB: withMods(stance, { armL: 125, armS: 170, elbowL: 10, hip: -12, knee: 20 }),
  /** The logo pose: the swallow. */
  swallow: logo,
  /** Arms together straight over the head, body straight, head down: the clean entry. */
  entry: withMods(logo, { root: 62, armL: 165, armS: 175, hip: -40, elbowL: -10 }),
  /** Flat on the water, arms still out. */
  slap: withMods(logo, { root: -60, armL: -40, armS: -80, hip: 10, knee: 25 }),
  /** Folded up and turning over (root is added on top while it spins). */
  tumble: withMods(logo, { root: 62, hip: 70, knee: 90, armL: 100, armS: 60, elbowL: 60 }),
  /** Afloat on his back afterwards, one arm up. */
  float: withMods(logo, { root: -75, armL: 60, armS: 40, hip: -10, knee: 30, elbowL: 40 }),
};

/** The swallow with the whole body turned by `root` degrees (negative is flatter, head up). */
export const swallowAt = (root: number) => withMods(logo, { root });
/** Any pose with extra turn on the whole body. */
export const turned = (p: Pose, root: number) => {
  const q = Float64Array.from(p);
  q[ci.root] += root;
  return q;
};

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const k = Math.min(1, Math.max(0, t));
  const p = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) p[i] = a[i] + (b[i] - a[i]) * k;
  return p;
}

// --- Skinning (the same maths as the hero engine) ---------------------------------------

const nb = data.bones.length;
const boneChan = data.chan.map((c) => ci[c]);
const M = new Float64Array(nb * 6);
const A = new Float64Array(nb);
const JW = new Float64Array(data.joints.pos.length * 2);
const shapes = data.shapes.map((s) => ({ pts: Float64Array.from(s.pts), base: Uint8Array.from(s.base), inf: s.inf, out: new Float64Array(s.pts.length) }));

function solve(pose: Pose) {
  for (let b = 0; b < nb; b++) {
    const th = pose[boneChan[b]] * DEG;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const px = data.pivot[b][0];
    const py = data.pivot[b][1];
    const le = px - c * px + s * py;
    const lf = py - s * px - c * py;
    const p = data.parent[b];
    const o = b * 6;
    if (p < 0) {
      // The root's own translation (dx, dy) is left out: the game places him itself.
      M[o] = c; M[o + 1] = s; M[o + 2] = -s; M[o + 3] = c; M[o + 4] = le; M[o + 5] = lf;
    } else {
      const q = p * 6;
      const pa = M[q], pb = M[q + 1], pc = M[q + 2], pd = M[q + 3];
      M[o] = pa * c + pc * s; M[o + 1] = pb * c + pd * s;
      M[o + 2] = -pa * s + pc * c; M[o + 3] = -pb * s + pd * c;
      M[o + 4] = pa * le + pc * lf + M[q + 4]; M[o + 5] = pb * le + pd * lf + M[q + 5];
    }
    A[b] = Math.atan2(M[o + 1], M[o]);
  }
  const jp = data.joints.pos;
  const jpar = data.joints.parent;
  for (let j = 0; j < jp.length; j++) {
    const q = jpar[j] * 6;
    JW[2 * j] = M[q] * jp[j][0] + M[q + 2] * jp[j][1] + M[q + 4];
    JW[2 * j + 1] = M[q + 1] * jp[j][0] + M[q + 3] * jp[j][1] + M[q + 5];
  }
  for (const s of shapes) {
    const P = s.pts, O = s.out, B = s.base, n = B.length;
    for (let i = 0; i < n; i++) {
      const o = B[i] * 6, x = P[2 * i], y = P[2 * i + 1];
      O[2 * i] = M[o] * x + M[o + 2] * y + M[o + 4];
      O[2 * i + 1] = M[o + 1] * x + M[o + 3] * y + M[o + 5];
    }
    for (const r of s.inf) {
      const i = r[0], j = r[1];
      let da = A[r[2]] - A[B[i]];
      da = ((((da + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      const a = r[3] * da;
      if (a === 0) continue;
      const c = Math.cos(a), sn = Math.sin(a), jx = JW[2 * j], jy = JW[2 * j + 1];
      const rx = O[2 * i] - jx, ry = O[2 * i + 1] - jy;
      O[2 * i] = jx + c * rx - sn * ry;
      O[2 * i + 1] = jy + sn * rx + c * ry;
    }
  }
}

/** The pelvis pivot: the point the game positions (it never moves, the bones turn around it). */
const HIP = { x: data.pivot[0][0], y: data.pivot[0][1] };

/** Rig units per metre, so that he stands 1.8 m tall; and how far his soles are below the hips. */
export const { UNITS_PER_M, SOLE_BELOW_HIP } = (() => {
  solve(stance);
  let top = Infinity;
  let bottom = -Infinity;
  for (const s of shapes) for (let i = 1; i < s.out.length; i += 2) {
    top = Math.min(top, s.out[i]);
    bottom = Math.max(bottom, s.out[i]);
  }
  const perM = (bottom - top) / 1.8;
  return { UNITS_PER_M: perM, SOLE_BELOW_HIP: (bottom - HIP.y) / perM };
})();

/**
 * Draws him with the hips at (0, 0) of the current canvas transform, in metres,
 * y pointing down (screen orientation), facing right.
 */
export function drawDiver(ctx: CanvasRenderingContext2D, pose: Pose, color: string) {
  solve(pose);
  const k = 1 / UNITS_PER_M;
  ctx.save();
  ctx.scale(k, k);
  ctx.translate(-HIP.x, -HIP.y);
  ctx.fillStyle = color;
  // Each part filled on its own, so where they overlap they add up instead of cancelling.
  for (const s of shapes) {
    const O = s.out;
    ctx.beginPath();
    ctx.moveTo(O[0], O[1]);
    for (let i = 2; i < O.length; i += 2) ctx.lineTo(O[i], O[i + 1]);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
