/**
 * Heart cam with an in-line translating roller follower (Brown #96).
 *
 * The cam turns CCW about the origin; the follower moves along +Y.
 * Displacement is uniform motion: s rises linearly for half a turn and falls
 * linearly for the other half, so the follower moves at constant speed.
 * The cam surface is generated from that same law (envelope of roller circles),
 * so the profile and the motion can never disagree.
 */
import { mod, polar, type Vec2 } from '@/core/math';
import { TAU } from '@/core/phase';

export const BASE_RADIUS = 0.45;
export const ROLLER_RADIUS = 0.2;
export const LIFT = 1.0;
/** Distance from the cam centre to the roller centre at zero lift. */
export const PRIME_RADIUS = BASE_RADIUS + ROLLER_RADIUS;

/** Follower displacement s(θ) — uniform motion, period 2π. */
export function displacement(theta: number): number {
  const t = mod(theta, TAU);
  return t <= Math.PI ? (LIFT * t) / Math.PI : LIFT * (2 - t / Math.PI);
}

/** Follower velocity per unit cam speed, ds/dθ (constant ±h/π). */
export function velocity(theta: number): number {
  return mod(theta, TAU) < Math.PI ? LIFT / Math.PI : -LIFT / Math.PI;
}

/** Roller centre in world coordinates. */
export function rollerCenter(theta: number): Vec2 {
  return [0, PRIME_RADIUS + displacement(theta)];
}

/** Pitch curve (roller centre path) in the cam's own frame. */
export function pitchPoint(theta: number): Vec2 {
  return polar(PRIME_RADIUS + displacement(theta), Math.PI / 2 - theta);
}

/**
 * Cam outline in its own frame: for each ray from the centre, the nearest
 * point touched by any roller position. Exact for a star-shaped cam.
 */
export function camOutline(rays = 540, samples = 1080): Vec2[] {
  const centres: Vec2[] = [];
  for (let i = 0; i < samples; i++) centres.push(pitchPoint((TAU * i) / samples));
  const r2 = ROLLER_RADIUS * ROLLER_RADIUS;
  const out: Vec2[] = [];
  for (let j = 0; j < rays; j++) {
    const a = (TAU * j) / rays;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let rho = Infinity;
    for (const [px, py] of centres) {
      const along = ux * px + uy * py;
      if (along <= 0) continue;
      const perp2 = px * px + py * py - along * along;
      if (perp2 > r2) continue;
      rho = Math.min(rho, along - Math.sqrt(r2 - perp2));
    }
    out.push([rho * ux, rho * uy]);
  }
  return out;
}
