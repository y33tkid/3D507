/**
 * Spur gear pair with true involute teeth.
 *
 * Driver (pinion) at the origin, follower at (+a, 0). Angles are CCW-positive.
 */
import { polar, type Vec2 } from '@/core/math';

export interface GearSpec {
  teeth: number;
  /** Module m = pitch diameter / teeth. */
  module: number;
  /** Pressure angle in radians. */
  pressureAngle: number;
  /** Circumferential backlash at the pitch circle (scene units). */
  backlash: number;
}

export const PRESSURE_ANGLE = (20 * Math.PI) / 180;
export const MODULE = 0.1;
export const BACKLASH = 0.008;

export const DRIVER: GearSpec = {
  teeth: 18,
  module: MODULE,
  pressureAngle: PRESSURE_ANGLE,
  backlash: BACKLASH,
};
export const FOLLOWER: GearSpec = { ...DRIVER, teeth: 36 };

export const pitchRadius = (g: GearSpec) => (g.module * g.teeth) / 2;
export const baseRadius = (g: GearSpec) => pitchRadius(g) * Math.cos(g.pressureAngle);
export const tipRadius = (g: GearSpec) => pitchRadius(g) + g.module;
export const rootRadius = (g: GearSpec) => pitchRadius(g) - 1.25 * g.module;

/** Standard centre distance a = m(N₁ + N₂)/2. */
export const CENTER_DISTANCE = pitchRadius(DRIVER) + pitchRadius(FOLLOWER);
export const RATIO = FOLLOWER.teeth / DRIVER.teeth;

const inv = (a: number) => Math.tan(a) - a;

/** Half the angular tooth thickness at radius r (involute flank). */
export function halfToothAngle(g: GearSpec, r: number): number {
  const rp = pitchRadius(g);
  const rb = baseRadius(g);
  const rr = Math.max(r, rb);
  const alphaR = Math.acos(rb / rr);
  const halfPitchThickness = Math.PI / (2 * g.teeth) - g.backlash / (2 * rp);
  return halfPitchThickness + inv(g.pressureAngle) - inv(alphaR);
}

/**
 * Closed outline of the gear (tooth 0 centred on +X), CCW.
 * Flanks are involutes from the base circle to the tip; below the base circle
 * a radial line joins the root circle.
 */
export function gearOutline(g: GearSpec, flankSteps = 8, arcSteps = 3): Vec2[] {
  const N = g.teeth;
  const pitch = (Math.PI * 2) / N;
  const rb = baseRadius(g);
  const ra = tipRadius(g);
  const rf = rootRadius(g);
  const rStart = Math.max(rb, rf);
  const pts: Vec2[] = [];

  for (let i = 0; i < N; i++) {
    const c = i * pitch;
    const psiStart = halfToothAngle(g, rStart);
    // root arc from the middle of the previous gap to the start of this tooth
    for (let k = 0; k < arcSteps; k++) {
      const a = c - pitch / 2 + ((pitch / 2 - psiStart) * k) / arcSteps;
      pts.push(polar(rf, a));
    }
    if (rf < rb) pts.push(polar(rf, c - psiStart));
    // leading flank (−ψ side), base → tip
    for (let k = 0; k <= flankSteps; k++) {
      const r = rStart + ((ra - rStart) * k) / flankSteps;
      pts.push(polar(r, c - halfToothAngle(g, r)));
    }
    // tip land
    const psiTip = halfToothAngle(g, ra);
    for (let k = 1; k < arcSteps; k++)
      pts.push(polar(ra, c - psiTip + (2 * psiTip * k) / arcSteps));
    // trailing flank (+ψ side), tip → base
    for (let k = flankSteps; k >= 0; k--) {
      const r = rStart + ((ra - rStart) * k) / flankSteps;
      pts.push(polar(r, c + halfToothAngle(g, r)));
    }
    if (rf < rb) pts.push(polar(rf, c + psiStart));
    for (let k = 1; k <= arcSteps; k++) {
      const a = c + psiStart + ((pitch / 2 - psiStart) * k) / arcSteps;
      if (k < arcSteps) pts.push(polar(rf, a));
    }
  }
  return pts;
}

/**
 * Follower angle for driver angle θ.
 * θ₂ = −θ·N₁/N₂ + π + π/N₂ — the phase term places a tooth gap of the
 * follower on the line of centres when a driver tooth points at it.
 */
export function followerAngle(theta: number): number {
  return -theta / RATIO + Math.PI + Math.PI / FOLLOWER.teeth;
}

/** Output speed ratio ω₂/ω₁ (negative: opposite sense). */
export const SPEED_RATIO = -1 / RATIO;
