/**
 * External Geneva drive.
 *
 * Driver (crank + pin + locking disc) at the origin, rotating CCW.
 * Wheel at (C, 0), rotating CW one slot (2π/n) per driver turn.
 * All dimensions derive from the slot count n and crank radius a so that the
 * pin enters and leaves each slot tangentially (no shock at engagement).
 */
import { mod, polar, wrapPi, type Vec2 } from '@/core/math';
import { TAU } from '@/core/phase';

export const SLOTS = 4;
export const CRANK_RADIUS = 1;
export const PIN_RADIUS = 0.1;
export const SLOT_HALF_WIDTH = 0.11;
/** Centre distance C = a / sin(π/n). */
export const CENTER_DISTANCE = CRANK_RADIUS / Math.sin(Math.PI / SLOTS);
/** Radius of the slot mouth b = a / tan(π/n) = √(C² − a²). */
export const SLOT_MOUTH_RADIUS = CRANK_RADIUS / Math.tan(Math.PI / SLOTS);
export const WHEEL_RADIUS = Math.hypot(SLOT_MOUTH_RADIUS, PIN_RADIUS);
/** Half the driver angle during which the pin is engaged: α = π/2 − π/n. */
export const ENGAGE_HALF_ANGLE = Math.PI / 2 - Math.PI / SLOTS;
export const STEP = TAU / SLOTS;
/** Radius of the locking disc on the driver, and the matching concave arcs on the wheel. */
export const LOCK_RADIUS = 0.7;
export const LOCK_CLEARANCE = 0.02;
/** Relief cut in the locking disc so the wheel can turn while the pin is engaged. */
export const RELIEF_RADIUS = WHEEL_RADIUS + 0.035;

/** Fraction of each driver turn spent moving the wheel: (n − 2) / 2n. */
export const MOTION_FRACTION = (2 * ENGAGE_HALF_ANGLE) / TAU;

export function pinPosition(theta: number): Vec2 {
  return polar(CRANK_RADIUS, theta);
}

export function isEngaged(theta: number): boolean {
  return Math.abs(wrapPi(theta)) < ENGAGE_HALF_ANGLE;
}

/**
 * Wheel angle as a closed-form function of the unbounded driver angle.
 * The driver turn index k counts completed indexing steps, so the result is
 * exact for scrubbing and reverse playback (no accumulated state).
 */
export function wheelAngle(theta: number): number {
  const k = Math.round(theta / TAU);
  const tw = theta - k * TAU; // in [−π, π]
  let local: number;
  if (tw <= -ENGAGE_HALF_ANGLE) local = Math.PI / SLOTS;
  else if (tw >= ENGAGE_HALF_ANGLE) local = -Math.PI / SLOTS;
  else {
    const psi = Math.atan2(
      CRANK_RADIUS * Math.sin(tw),
      CRANK_RADIUS * Math.cos(tw) - CENTER_DISTANCE,
    );
    local = wrapPi(psi - Math.PI);
  }
  return local - k * STEP;
}

/** Rotation applied to the wheel's own outline (slot 0 on its +X axis). */
export function wheelRotation(theta: number): number {
  return wheelAngle(theta) + Math.PI;
}

/** Arc through the side of a circle that faces `facing` (angle), between two points on it. */
function arcFacing(c: Vec2, r: number, p1: Vec2, p2: Vec2, facing: number, steps: number): Vec2[] {
  const g1 = wrapPi(Math.atan2(p1[1] - c[1], p1[0] - c[0]) - facing);
  const g2 = wrapPi(Math.atan2(p2[1] - c[1], p2[0] - c[0]) - facing);
  const out: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const g = facing + g1 + ((g2 - g1) * i) / steps;
    out.push([c[0] + r * Math.cos(g), c[1] + r * Math.sin(g)]);
  }
  return out;
}

/** Wheel outline in its own frame, slot j along angle j·2π/n, CCW. */
export function wheelOutline(): Vec2[] {
  const Ro = WHEEL_RADIUS;
  const w = SLOT_HALF_WIDTH;
  const t = Math.sqrt(Ro * Ro - w * w);
  const wallAngle = Math.atan2(w, t);
  const rBottom = CENTER_DISTANCE - CRANK_RADIUS;
  const Rcv = LOCK_RADIUS + LOCK_CLEARANCE;
  const delta = Math.acos(
    (Ro * Ro + CENTER_DISTANCE ** 2 - Rcv * Rcv) / (2 * Ro * CENTER_DISTANCE),
  );
  const pts: Vec2[] = [];
  for (let j = 0; j < SLOTS; j++) {
    const d = j * STEP;
    const u: Vec2 = [Math.cos(d), Math.sin(d)];
    const v: Vec2 = [-Math.sin(d), Math.cos(d)];
    const at = (s: number, off: number): Vec2 => [u[0] * s + v[0] * off, u[1] * s + v[1] * off];
    // right wall inward, round slot bottom, left wall outward
    pts.push(at(t, -w));
    const bc = at(rBottom, 0);
    for (let i = 0; i <= 12; i++) {
      const a = d - Math.PI / 2 - (Math.PI * i) / 12;
      pts.push([bc[0] + w * Math.cos(a), bc[1] + w * Math.sin(a)]);
    }
    pts.push(at(t, w));
    // outer land, concave locking arc, outer land
    const m = d + STEP / 2;
    const a0 = d + wallAngle;
    const a1 = m - delta;
    for (let i = 1; i <= 4; i++) pts.push(polar(Ro, a0 + ((a1 - a0) * i) / 4));
    const pc = polar(CENTER_DISTANCE, m);
    const concave = arcFacing(pc, Rcv, polar(Ro, m - delta), polar(Ro, m + delta), m + Math.PI, 24);
    pts.push(...concave.slice(1, -1));
    const b0 = m + delta;
    const b1 = d + STEP - wallAngle;
    for (let i = 0; i < 4; i++) pts.push(polar(Ro, b0 + ((b1 - b0) * i) / 4));
  }
  return pts;
}

/** Locking disc in the driver frame: full circle with a relief cut facing the pin (+X). */
export function lockingDiscOutline(): Vec2[] {
  const R = LOCK_RADIUS;
  const C = CENTER_DISTANCE;
  const Rc = RELIEF_RADIUS;
  const x = (R * R - Rc * Rc + C * C) / (2 * C);
  const phi = Math.acos(x / R);
  const pts: Vec2[] = [];
  for (let i = 0; i <= 64; i++) pts.push(polar(R, phi + ((TAU - 2 * phi) * i) / 64));
  const cut = arcFacing([C, 0], Rc, polar(R, -phi), polar(R, phi), Math.PI, 24);
  pts.push(...cut.slice(1, -1));
  return pts;
}

/** Index of the wheel slot (in the wheel frame) that a world-space angle points along. */
export function slotPhase(angleInWheelFrame: number): number {
  const p = mod(angleInWheelFrame, STEP);
  return Math.min(p, STEP - p);
}
