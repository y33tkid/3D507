/**
 * Scotch yoke: crank pin of radius R slides in a vertical slot of a yoke
 * constrained to move along X. Crank centre at the origin, CCW positive.
 */
export const CRANK_RADIUS = 1;
export const PIN_RADIUS = 0.12;
/** Slot clearance around the pin. */
export const SLOT_CLEARANCE = 0.01;
/** Slot half-length: full pin travel ±R, plus the pin itself and a margin. */
export const SLOT_HALF_LENGTH = CRANK_RADIUS + PIN_RADIUS + 0.08;
export const SLOT_HALF_WIDTH = PIN_RADIUS + SLOT_CLEARANCE;

export function pinPosition(theta: number): [number, number] {
  return [CRANK_RADIUS * Math.cos(theta), CRANK_RADIUS * Math.sin(theta)];
}

/** Yoke displacement x = R·cos θ — pure simple harmonic motion. */
export function yokeX(theta: number): number {
  return CRANK_RADIUS * Math.cos(theta);
}

/** Yoke velocity per unit crank speed: dx/dθ = −R·sin θ. */
export function yokeVelocity(theta: number): number {
  return -CRANK_RADIUS * Math.sin(theta);
}

/** Pin position along the slot, measured from the slot centre. */
export function pinSlotOffset(theta: number): number {
  return pinPosition(theta)[1];
}

/** Yoke body half-width (slot plus side walls). */
export const YOKE_HALF_WIDTH = SLOT_HALF_WIDTH + 0.16;
/** Guide bushings, fixed to the frame at ±GUIDE_X. */
export const GUIDE_X = 2.35;
export const GUIDE_HALF_LENGTH = 0.2;
/** Each rod must still fill its bushing at the far end of the stroke. */
export const ROD_LENGTH = GUIDE_X + GUIDE_HALF_LENGTH + CRANK_RADIUS - YOKE_HALF_WIDTH + 0.25;

/** Extent [inner, outer] of the right-hand rod along X at crank angle θ. */
export function rightRodSpan(theta: number): [number, number] {
  const x = yokeX(theta);
  return [x + YOKE_HALF_WIDTH, x + YOKE_HALF_WIDTH + ROD_LENGTH];
}
