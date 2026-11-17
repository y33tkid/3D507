import { describe, expect, it } from 'vitest';
import { distanceToPolygon, pointInPolygon, rotate, type Vec2 } from '@/core/math';
import { TAU } from '@/core/phase';
import {
  camOutline,
  displacement,
  LIFT,
  ROLLER_RADIUS,
  rollerCenter,
  velocity,
} from './kinematics';

describe('heart cam', () => {
  it('rises and falls by the full lift with uniform speed', () => {
    expect(displacement(0)).toBeCloseTo(0);
    expect(displacement(Math.PI)).toBeCloseTo(LIFT);
    expect(displacement(TAU)).toBeCloseTo(0);
    expect(displacement(Math.PI / 2)).toBeCloseTo(LIFT / 2);
    expect(displacement(1.5 * Math.PI)).toBeCloseTo(LIFT / 2);
    expect(velocity(0.3)).toBeCloseTo(-velocity(4));
  });

  it('roller touches the cam surface without penetrating it at every angle', () => {
    const cam = camOutline();
    for (let t = 0; t < TAU; t += TAU / 240) {
      // bring the roller into the cam frame
      const c: Vec2 = rotate(rollerCenter(t), -t);
      expect(pointInPolygon(c, cam)).toBe(false);
      const d = distanceToPolygon(c, cam);
      expect(d, `θ=${t.toFixed(3)}`).toBeGreaterThan(ROLLER_RADIUS - 2e-3);
      expect(d, `θ=${t.toFixed(3)}`).toBeLessThan(ROLLER_RADIUS + 1.5e-2);
    }
  });
});
