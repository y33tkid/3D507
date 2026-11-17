import type { ComponentType, LazyExoticComponent } from 'react';

/** Top-level families used for navigation and filtering. */
export const CATEGORIES = [
  'Gears',
  'Linkages',
  'Cams',
  'Ratchets & Escapements',
  'Pulleys & Belts',
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Colour-coded role of a part in the power path.
 * driver → intermediate → output, with `frame` for fixed parts.
 */
export type PartRole = 'driver' | 'intermediate' | 'output' | 'frame';

export interface PartDescriptor {
  role: PartRole;
  name: string;
}

/** A named instant in the cycle (fraction 0–1 of one driver cycle). */
export interface Keyframe {
  at: number;
  label: string;
}

/** Optional live plot of an output quantity against the driver angle. */
export interface MotionPlot {
  label: string;
  unit: string;
  /** Pure function of the unbounded driver angle θ (radians). */
  sample: (theta: number) => number;
}

/** Props every mechanism model receives. Models read the phase clock themselves. */
export type MechanismModelProps = Record<string, never>;

export type MechanismModel =
  | ComponentType<MechanismModelProps>
  | LazyExoticComponent<ComponentType<MechanismModelProps>>;

/**
 * Everything the UI needs to know about one movement.
 * Text lives here; geometry and motion live in the model + kinematics files.
 */
export interface MechanismDefinition {
  /** URL-safe slug, unique. */
  id: string;
  /** Movement number in Brown's 507 Mechanical Movements (1868). */
  number: number;
  title: string;
  category: Category;
  motion: { from: string; to: string };
  /** One sentence, shown in lists and cards. */
  summary: string;
  /** Short paragraph(s) on the principle and the force path. */
  howItWorks: string[];
  applications: { summary: string; examples: string[] };
  /** How this model relates to Brown's original plate, when not an exact match. */
  referenceNote?: string;
  /** Shown while Reverse is on, when rewinding shows something the real machine cannot do. */
  reverseNote?: string;
  parts: PartDescriptor[];
  keyframes?: Keyframe[];
  plot?: MotionPlot;
  /**
   * Orbit target, preferred viewing distance, overall width of the assembly
   * (used to back the camera off on narrow screens) and the floor height.
   */
  camera: { target: [number, number, number]; distance: number; width: number; floorY: number };
  Model: MechanismModel;
}
