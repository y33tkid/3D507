/** Small, dependency-free geometry helpers shared by kinematics files. */
import { TAU } from './phase';

export type Vec2 = [number, number];

/** Wrap an angle to (−π, π]. */
export function wrapPi(a: number): number {
  const w = a - TAU * Math.round(a / TAU);
  return w <= -Math.PI ? w + TAU : w;
}

/** Positive modulo. */
export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function rotate([x, y]: Vec2, a: number): Vec2 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

export function polar(r: number, a: number): Vec2 {
  return [r * Math.cos(a), r * Math.sin(a)];
}

export function dist([ax, ay]: Vec2, [bx, by]: Vec2): number {
  return Math.hypot(ax - bx, ay - by);
}

/** Arc of points (inclusive) from angle a0 to a1 around centre c. */
export function arc(c: Vec2, r: number, a0: number, a1: number, segments: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = a0 + ((a1 - a0) * i) / segments;
    out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return out;
}

/** Even–odd point-in-polygon test. */
export function pointInPolygon([px, py]: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Shortest distance from a point to a closed polyline. */
export function distanceToPolygon(p: Vec2, poly: Vec2[]): number {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j]!;
    const b = poly[i]!;
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby || 1e-12;
    const t = clamp(((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / len2, 0, 1);
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * abx, p[1] - a[1] - t * aby));
  }
  return best;
}
