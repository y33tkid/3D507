import { useFrame } from '@react-three/fiber';
import { getTheta } from '@/core/phase';

/**
 * Run `apply(θ)` every frame, after the clock has advanced.
 * Models use this to pose refs from their pure kinematics functions.
 */
export function usePhaseFrame(apply: (theta: number) => void): void {
  useFrame(() => apply(getTheta()));
}
