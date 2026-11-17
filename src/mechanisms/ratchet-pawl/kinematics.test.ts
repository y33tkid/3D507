import { describe, expect, it } from 'vitest';
import { TAU } from '@/core/phase';
import {
  drivingPawl,
  holdingPawl,
  isForwardStroke,
  isSeated,
  leverAngle,
  ROOT_RADIUS,
  SLACK,
  STEP,
  TIP_RADIUS,
  toothRadius,
  wheelAngle,
} from './kinematics';

describe('ratchet and pawl', () => {
  it('advances exactly one tooth per lever cycle', () => {
    for (let k = -2; k <= 2; k++) {
      expect(wheelAngle((k + 1) * TAU) - wheelAngle(k * TAU)).toBeCloseTo(STEP);
    }
  });

  it('never turns backwards as θ increases (one-way)', () => {
    let prev = wheelAngle(-TAU);
    for (let t = -TAU; t < 3 * TAU; t += 0.002) {
      const w = wheelAngle(t);
      expect(w).toBeGreaterThanOrEqual(prev - 1e-12);
      prev = w;
    }
  });

  it('holds still during the return stroke and during the slack', () => {
    expect(wheelAngle(Math.PI + 0.2)).toBeCloseTo(wheelAngle(TAU - 0.2));
    const tSlack = Math.acos(1 - (2 * SLACK) / (STEP + SLACK)); // λ = slack
    expect(wheelAngle(tSlack * 0.9)).toBeCloseTo(wheelAngle(0));
    expect(leverAngle(Math.PI)).toBeCloseTo(STEP + SLACK);
  });

  it('driving pawl is seated against a face while it pushes', () => {
    for (let t = 1.2; t < Math.PI - 0.05; t += 0.05) {
      expect(isForwardStroke(t)).toBe(true);
      expect(isSeated(drivingPawl(t).tip)).toBe(true);
    }
  });

  it('holding pawl is seated (locking) through the return stroke', () => {
    for (let t = Math.PI + 0.05; t < TAU - 0.05; t += 0.05) {
      expect(isSeated(holdingPawl(t).tip)).toBe(true);
    }
  });

  it('holding pawl lifts over a tooth during the forward stroke (the click)', () => {
    let maxR = 0;
    for (let t = 0; t <= Math.PI; t += 0.01) {
      const [x, y] = holdingPawl(t).tip;
      maxR = Math.max(maxR, Math.hypot(x, y));
    }
    expect(maxR).toBeGreaterThan(TIP_RADIUS - 0.05);
  });

  it('pawl tips stay on the tooth surface (no penetration)', () => {
    for (let t = 0; t < TAU; t += 0.01) {
      for (const pawl of [drivingPawl(t), holdingPawl(t)]) {
        const [x, y] = pawl.tip;
        const r = Math.hypot(x, y);
        const phi = Math.atan2(y, x) - wheelAngle(t);
        const surface = toothRadius(phi);
        const fromFace = ((phi % STEP) + STEP) % STEP;
        const atFace = fromFace < 0.04 || fromFace > STEP - 0.04;
        if (!atFace) expect(r, `θ=${t.toFixed(2)}`).toBeGreaterThanOrEqual(surface - 0.01);
        expect(r).toBeGreaterThanOrEqual(ROOT_RADIUS - 1e-6);
        expect(r).toBeLessThanOrEqual(TIP_RADIUS + 1e-6);
      }
    }
  });
});
