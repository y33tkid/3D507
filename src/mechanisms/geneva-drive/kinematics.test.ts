import { describe, expect, it } from 'vitest';
import { distanceToPolygon, pointInPolygon, rotate, type Vec2 } from '@/core/math';
import { TAU } from '@/core/phase';
import {
  CENTER_DISTANCE,
  CRANK_RADIUS,
  isEngaged,
  LOCK_RADIUS,
  lockingDiscOutline,
  MOTION_FRACTION,
  pinPosition,
  PIN_RADIUS,
  SLOTS,
  slotPhase,
  STEP,
  wheelAngle,
  wheelOutline,
  wheelRotation,
} from './kinematics';

const toWheelFrame = (p: Vec2, theta: number): Vec2 =>
  rotate([p[0] - CENTER_DISTANCE, p[1]], -wheelRotation(theta));

describe('geneva drive', () => {
  it('derives centre distance so the pin enters tangentially', () => {
    // at the engagement instant the crank arm is perpendicular to the slot line
    const alpha = Math.PI / 2 - Math.PI / SLOTS;
    const pin = pinPosition(-alpha);
    const crankDir: Vec2 = [Math.cos(-alpha), Math.sin(-alpha)];
    const slotDir: Vec2 = [pin[0] - CENTER_DISTANCE, pin[1]];
    expect(crankDir[0] * slotDir[0] + crankDir[1] * slotDir[1]).toBeCloseTo(0, 10);
  });

  it('advances exactly one slot per driver turn, in the opposite sense', () => {
    for (let k = -3; k <= 3; k++) {
      expect(wheelAngle((k + 1) * TAU) - wheelAngle(k * TAU)).toBeCloseTo(-STEP);
    }
  });

  it('is continuous (no jumps) across dwell/motion boundaries and turn boundaries', () => {
    let prev = wheelAngle(-10);
    for (let t = -10; t < 10; t += 0.001) {
      const w = wheelAngle(t);
      expect(Math.abs(w - prev)).toBeLessThan(0.01);
      prev = w;
    }
  });

  it('dwells while disengaged', () => {
    expect(isEngaged(Math.PI)).toBe(false);
    expect(wheelAngle(Math.PI - 0.5)).toBeCloseTo(wheelAngle(Math.PI + 0.5));
    expect(MOTION_FRACTION).toBeCloseTo((SLOTS - 2) / (2 * SLOTS));
  });

  it('keeps the pin on a slot centre-line during engagement', () => {
    for (let t = -0.75; t <= 0.75; t += 0.01) {
      if (!isEngaged(t)) continue;
      const local = toWheelFrame(pinPosition(t), t);
      const a = Math.atan2(local[1], local[0]);
      expect(slotPhase(a)).toBeLessThan(1e-9);
      expect(Math.hypot(...local)).toBeGreaterThanOrEqual(CENTER_DISTANCE - CRANK_RADIUS - 1e-9);
    }
  });

  it('pin never cuts into the wheel material', () => {
    const wheel = wheelOutline();
    for (let t = 0; t < TAU; t += TAU / 720) {
      const local = toWheelFrame(pinPosition(t), t);
      if (pointInPolygon(local, wheel)) {
        expect(distanceToPolygon(local, wheel)).toBeGreaterThan(PIN_RADIUS - 1e-3);
      }
    }
  });

  it('locking disc never collides with the wheel', () => {
    const wheel = wheelOutline();
    const disc = lockingDiscOutline();
    for (let t = 0; t < TAU; t += TAU / 360) {
      for (const p of disc) {
        const world = rotate(p, t);
        const local = toWheelFrame(world, t);
        expect(pointInPolygon(local, wheel), `θ=${t.toFixed(3)}`).toBe(false);
      }
    }
  });

  it('wheel never cuts into the locking disc (reverse direction of the check)', () => {
    const wheel = wheelOutline();
    const disc = lockingDiscOutline();
    for (let t = 0; t < TAU; t += TAU / 360) {
      for (const p of wheel) {
        // wheel point → world → driver frame
        const [wx, wy] = rotate(p, wheelRotation(t));
        const local = rotate([wx + CENTER_DISTANCE, wy], -t);
        expect(pointInPolygon(local, disc), `θ=${t.toFixed(3)}`).toBe(false);
      }
    }
  });

  it('collision check has teeth: a disc without the relief cut does collide', () => {
    const wheel = wheelOutline();
    const fullDisc: Vec2[] = Array.from({ length: 72 }, (_, i) => [
      LOCK_RADIUS * Math.cos((i / 72) * TAU),
      LOCK_RADIUS * Math.sin((i / 72) * TAU),
    ]);
    const hits = [0.3, 0.5, 0.7].some((t) =>
      fullDisc.some((p) => pointInPolygon(toWheelFrame(rotate(p, t), t), wheel)),
    );
    expect(hits).toBe(true);
  });
});
