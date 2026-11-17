import { describe, expect, it } from 'vitest';
import {
  CRANK_RADIUS,
  GUIDE_HALF_LENGTH,
  GUIDE_X,
  rightRodSpan,
  PIN_RADIUS,
  pinPosition,
  pinSlotOffset,
  SLOT_HALF_LENGTH,
  yokeVelocity,
  yokeX,
} from './kinematics';

describe('scotch yoke', () => {
  it('keeps the pin on the slot centre-line (yoke x equals pin x)', () => {
    for (let t = -7; t < 7; t += 0.05) expect(yokeX(t)).toBeCloseTo(pinPosition(t)[0], 12);
  });

  it('slot is long enough for the full pin travel', () => {
    for (let t = 0; t < Math.PI * 2; t += 0.01) {
      expect(Math.abs(pinSlotOffset(t)) + PIN_RADIUS).toBeLessThan(SLOT_HALF_LENGTH);
    }
  });

  it('produces a stroke of 2R with dead centres at 0 and π', () => {
    expect(yokeX(0) - yokeX(Math.PI)).toBeCloseTo(2 * CRANK_RADIUS);
    expect(yokeVelocity(0)).toBeCloseTo(0);
    expect(yokeVelocity(Math.PI)).toBeCloseTo(0);
    expect(Math.abs(yokeVelocity(Math.PI / 2))).toBeCloseTo(CRANK_RADIUS);
  });

  it('velocity matches the numerical derivative of displacement', () => {
    const h = 1e-6;
    for (let t = 0; t < 6; t += 0.37) {
      expect((yokeX(t + h) - yokeX(t - h)) / (2 * h)).toBeCloseTo(yokeVelocity(t), 6);
    }
  });

  it('rods stay engaged in their guide bushings through the whole stroke', () => {
    for (let t = 0; t < Math.PI * 2; t += 0.01) {
      const [inner, outer] = rightRodSpan(t);
      expect(inner).toBeLessThan(GUIDE_X - GUIDE_HALF_LENGTH);
      expect(outer).toBeGreaterThan(GUIDE_X + GUIDE_HALF_LENGTH);
    }
  });
});
