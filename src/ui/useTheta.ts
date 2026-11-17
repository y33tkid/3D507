import { useEffect, useState } from 'react';
import { getTheta } from '@/core/phase';

/**
 * Low-rate React mirror of the phase clock for UI readouts.
 * The 3D scene reads the clock every frame; text does not need to.
 */
export function useTheta(hz = 20): number {
  const [theta, set] = useState(getTheta);
  useEffect(() => {
    const id = window.setInterval(() => set(getTheta()), 1000 / hz);
    return () => window.clearInterval(id);
  }, [hz]);
  return theta;
}
