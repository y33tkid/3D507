/**
 * Ratchet wheel driven by an oscillating lever with a driving pawl, plus a
 * fixed holding (detent) pawl. Wheel at the origin, advancing CCW only.
 *
 * Input θ drives the lever harmonically: λ = (A/2)(1 − cos θ).
 * Forward stroke (0…π): the driving pawl takes up a little slack, then pushes
 * a tooth face. Return stroke (π…2π): the driving pawl clicks back over the
 * teeth while the holding pawl keeps the wheel from turning back.
 */
import { clamp, mod, polar, wrapPi, type Vec2 } from '@/core/math';
import { TAU } from '@/core/phase';

export const TEETH = 12;
export const STEP = TAU / TEETH;
export const ROOT_RADIUS = 0.8;
export const TIP_RADIUS = 1.0;
/** Lost motion before the pawl meets a face, as an angle. */
export const SLACK = 0.25 * STEP;
/** Lever swing: one tooth plus the slack. */
export const LEVER_SWING = STEP + SLACK;

/** Pawl pattern: pivot sits PIVOT_LEAD radians CW of the tip, at PIVOT_RADIUS. */
export const PIVOT_RADIUS = 1.15;
export const PIVOT_LEAD = 0.42;
export const PAWL_LENGTH = Math.hypot(
  PIVOT_RADIUS * Math.cos(-PIVOT_LEAD) - ROOT_RADIUS,
  PIVOT_RADIUS * Math.sin(-PIVOT_LEAD),
);

/** Driving pawl tip seats at this lever-frame angle when the lever is at rest. */
export const DRIVE_TIP_ANGLE = Math.PI / 2;
const DRIVE_EPS = 0.002;
const HOLD_EPS = 0.03;
/** Wheel phase so the driving pawl meets a face exactly after the slack. */
export const WHEEL_PHASE = DRIVE_TIP_ANGLE + SLACK + DRIVE_EPS;
/** Holding pawl tip seat angle, chosen near 200° and in phase with the teeth. */
export const HOLD_TIP_ANGLE = (() => {
  const target = (200 * Math.PI) / 180;
  const base = WHEEL_PHASE - HOLD_EPS;
  return base + Math.round((target - base) / STEP) * STEP;
})();

export function leverAngle(theta: number): number {
  return (LEVER_SWING / 2) * (1 - Math.cos(theta));
}

export function isForwardStroke(theta: number): boolean {
  return mod(theta, TAU) <= Math.PI;
}

/** Wheel angle — a closed-form, non-decreasing step function of θ. */
export function wheelAngle(theta: number): number {
  const k = Math.floor(theta / TAU);
  const tw = theta - k * TAU;
  const advance = tw <= Math.PI ? Math.max(0, leverAngle(tw) - SLACK) : STEP;
  return WHEEL_PHASE + k * STEP + advance;
}

/** Radius of the wheel's outline at wheel-frame angle φ (sawtooth, radial faces). */
export function toothRadius(phi: number): number {
  const frac = mod(phi, STEP) / STEP;
  return ROOT_RADIUS + (TIP_RADIUS - ROOT_RADIUS) * (1 - frac);
}

export function wheelOutline(stepsPerTooth = 10): Vec2[] {
  const pts: Vec2[] = [];
  for (let j = 0; j < TEETH; j++) {
    for (let i = 0; i <= stepsPerTooth; i++) {
      const s = i / stepsPerTooth;
      const phi = j * STEP + s * STEP * (i === stepsPerTooth ? 0.9999 : 1);
      pts.push(polar(ROOT_RADIUS + (TIP_RADIUS - ROOT_RADIUS) * (1 - s), phi));
    }
  }
  return pts;
}

/** Pivot of a pawl whose tip seats at root radius at angle `tipAngle`. */
export function pawlPivot(tipAngle: number): Vec2 {
  return polar(PIVOT_RADIUS, tipAngle - PIVOT_LEAD);
}

/** Point on circle |p| = r that is distance PAWL_LENGTH from the pivot, on the CCW side. */
function tipAtRadius(pivot: Vec2, r: number): Vec2 {
  const d = Math.hypot(pivot[0], pivot[1]);
  const a = (r * r - PAWL_LENGTH * PAWL_LENGTH + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const ux = pivot[0] / d;
  const uy = pivot[1] / d;
  const mx = ux * a;
  const my = uy * a;
  // the CCW-side intersection (rotate +90° from the pivot direction)
  return [mx - uy * h, my + ux * h];
}

/**
 * Pose of a spring-loaded pawl riding on the wheel.
 * Returns the swing angle β of the pawl (direction pivot → tip) and its tip.
 */
export function pawlPose(pivot: Vec2, wheel: number, seatAngle: number) {
  let phi = seatAngle;
  let tip: Vec2 = polar(ROOT_RADIUS, seatAngle);
  for (let i = 0; i < 5; i++) {
    const r = clamp(toothRadius(phi - wheel), ROOT_RADIUS, TIP_RADIUS);
    tip = tipAtRadius(pivot, r);
    phi = seatAngle + wrapPi(Math.atan2(tip[1], tip[0]) - seatAngle);
  }
  return { beta: Math.atan2(tip[1] - pivot[1], tip[0] - pivot[0]), tip };
}

export function drivingPawl(theta: number) {
  const lever = leverAngle(theta);
  const seat = DRIVE_TIP_ANGLE + lever;
  const pivot = pawlPivot(seat);
  return { pivot, ...pawlPose(pivot, wheelAngle(theta), seat) };
}

export function holdingPawl(theta: number) {
  const pivot = pawlPivot(HOLD_TIP_ANGLE);
  return { pivot, ...pawlPose(pivot, wheelAngle(theta), HOLD_TIP_ANGLE) };
}

/** Is the given pawl tip seated in a tooth root (i.e. locking/driving)? */
export function isSeated(tip: Vec2): boolean {
  return Math.hypot(tip[0], tip[1]) < ROOT_RADIUS + 0.01;
}
