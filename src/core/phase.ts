/**
 * The phase clock: a single, unbounded driver angle θ in radians.
 *
 * It lives outside React state on purpose: it changes every frame, and models
 * read it inside `useFrame` to mutate Three.js objects directly. Play, speed,
 * reverse and the scrubber only ever change this value; every pose is a pure
 * function of θ, so scrubbing and reversing are exact.
 */
export const TAU = Math.PI * 2;

const clock = { theta: 0 };

export function getTheta(): number {
  return clock.theta;
}

export function setTheta(theta: number): void {
  clock.theta = theta;
}

export function advanceTheta(delta: number): void {
  clock.theta += delta;
}

/** Position within the current cycle, in [0, 1). */
export function cycleFraction(theta: number): number {
  const f = (theta % TAU) / TAU;
  return f < 0 ? f + 1 : f;
}

/** Index of the current cycle (floor of θ / 2π). */
export function cycleIndex(theta: number): number {
  return Math.floor(theta / TAU);
}
