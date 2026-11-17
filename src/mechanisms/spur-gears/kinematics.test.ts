import { describe, expect, it } from 'vitest';
import { distanceToPolygon, pointInPolygon, rotate, type Vec2 } from '@/core/math';
import {
  CENTER_DISTANCE,
  DRIVER,
  FOLLOWER,
  followerAngle,
  gearOutline,
  halfToothAngle,
  tipRadius,
} from './kinematics';

const place = (pts: Vec2[], a: number, dx: number): Vec2[] =>
  pts.map((p) => {
    const [x, y] = rotate(p, a);
    return [x + dx, y];
  });

describe('spur gears', () => {
  it('uses the standard centre distance m(N1+N2)/2', () => {
    expect(CENTER_DISTANCE).toBeCloseTo((DRIVER.module * (DRIVER.teeth + FOLLOWER.teeth)) / 2);
  });

  it('teeth are not pointed at the tip', () => {
    expect(halfToothAngle(DRIVER, tipRadius(DRIVER))).toBeGreaterThan(0.02);
    expect(halfToothAngle(FOLLOWER, tipRadius(FOLLOWER))).toBeGreaterThan(0.01);
  });

  it('drives the follower at −N1/N2 of the input speed', () => {
    const d = followerAngle(1) - followerAngle(0);
    expect(d).toBeCloseTo(-DRIVER.teeth / FOLLOWER.teeth);
  });

  it('meshes without interference and stays in contact through a full tooth pitch', () => {
    const a = gearOutline(DRIVER, 16, 4);
    const b = gearOutline(FOLLOWER, 16, 4);
    const pitch = (Math.PI * 2) / DRIVER.teeth;
    for (let i = 0; i <= 60; i++) {
      const theta = (pitch * i) / 60;
      const pa = place(a, theta, 0);
      const pb = place(b, followerAngle(theta), CENTER_DISTANCE);
      // no driver vertex may sit inside the follower, and vice versa
      const near = pa.filter(([x]) => x > CENTER_DISTANCE / 4);
      const nearB = pb.filter(([x]) => x < CENTER_DISTANCE / 2);
      const pen = near.filter((p) => pointInPolygon(p, pb) && distanceToPolygon(p, pb) > 1e-3);
      const penB = nearB.filter((p) => pointInPolygon(p, pa) && distanceToPolygon(p, pa) > 1e-3);
      expect(pen.length, `driver into follower at θ=${theta.toFixed(3)}`).toBe(0);
      expect(penB.length, `follower into driver at θ=${theta.toFixed(3)}`).toBe(0);
      // and the gap between profiles is small (they actually touch)
      const gap = Math.min(...near.map((p) => distanceToPolygon(p, pb)));
      expect(gap).toBeLessThan(0.02);
    }
  });
});
