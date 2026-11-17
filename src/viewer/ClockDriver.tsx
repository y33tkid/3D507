import { useFrame } from '@react-three/fiber';
import { advanceTheta, TAU } from '@/core/phase';
import { SECONDS_PER_CYCLE, useAppStore } from '@/store/useAppStore';

/** Advances the phase clock. Runs before model frames (priority −1). */
export function ClockDriver() {
  useFrame((_, dt) => {
    const { playing, speed, reverse } = useAppStore.getState();
    if (!playing) return;
    const step = Math.min(dt, 0.1) * (TAU / SECONDS_PER_CYCLE) * speed * (reverse ? -1 : 1);
    advanceTheta(step);
  }, -1);
  return null;
}
