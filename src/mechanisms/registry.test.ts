import { describe, expect, it } from 'vitest';
import { filterMechanisms } from '@/core/filter';
import { CATEGORIES } from '@/core/types';
import { MECHANISMS } from './index';

describe('mechanism registry', () => {
  it('has unique ids and Brown numbers in range', () => {
    const ids = new Set(MECHANISMS.map((m) => m.id));
    expect(ids.size).toBe(MECHANISMS.length);
    for (const m of MECHANISMS) {
      expect(m.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(m.number).toBeGreaterThanOrEqual(1);
      expect(m.number).toBeLessThanOrEqual(507);
    }
  });

  it('follows the content style guide', () => {
    for (const m of MECHANISMS) {
      expect(CATEGORIES).toContain(m.category);
      expect(m.summary.length, m.id).toBeLessThanOrEqual(140);
      expect(m.howItWorks.length, m.id).toBeGreaterThanOrEqual(1);
      expect(m.howItWorks.join(' ').split(/\s+/).length, m.id).toBeLessThanOrEqual(150);
      expect(m.applications.examples.length, m.id).toBeGreaterThanOrEqual(2);
      expect(m.applications.examples.length, m.id).toBeLessThanOrEqual(3);
      expect(
        m.parts.some((p) => p.role === 'driver'),
        m.id,
      ).toBe(true);
      expect(
        m.parts.some((p) => p.role === 'output'),
        m.id,
      ).toBe(true);
      for (const k of m.keyframes ?? []) {
        expect(k.at).toBeGreaterThanOrEqual(0);
        expect(k.at).toBeLessThan(1);
      }
    }
  });

  it('plots are finite across a cycle', () => {
    for (const m of MECHANISMS) {
      if (!m.plot) continue;
      for (let t = 0; t < Math.PI * 2; t += 0.1)
        expect(Number.isFinite(m.plot.sample(t))).toBe(true);
    }
  });

  it('filters by category and by search words', () => {
    expect(filterMechanisms(MECHANISMS, '', 'Gears').map((m) => m.id)).toEqual(['spur-gears']);
    expect(filterMechanisms(MECHANISMS, 'intermittent', 'All').length).toBeGreaterThanOrEqual(2);
    expect(filterMechanisms(MECHANISMS, '#93', 'All').map((m) => m.id)).toEqual(['scotch-yoke']);
    expect(filterMechanisms(MECHANISMS, 'zzz', 'All')).toEqual([]);
  });
});
