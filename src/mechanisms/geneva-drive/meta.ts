import { lazy } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { ENGAGE_HALF_ANGLE, MOTION_FRACTION, SLOTS, wheelAngle } from './kinematics';

const engageAt = 1 - ENGAGE_HALF_ANGLE / (Math.PI * 2);

export const genevaDrive: MechanismDefinition = {
  id: 'geneva-drive',
  number: 212,
  title: 'Geneva Drive',
  category: 'Ratchets & Escapements',
  motion: { from: 'Continuous rotary', to: 'Intermittent rotary' },
  summary: `A pin on a constantly turning crank steps a ${SLOTS}-slot wheel a quarter turn, then locks it still.`,
  howItWorks: [
    `Once per turn the driver’s pin slides into a slot of the wheel and swings it through one ${360 / SLOTS}° step. The centre distance is chosen so the pin enters and leaves each slot tangentially, so the wheel starts and stops smoothly instead of with a jolt.`,
    `For the rest of the turn the pin is clear of the wheel and the round locking disc on the driver sits in a concave notch of the wheel, holding it firmly in place. With ${SLOTS} slots the wheel moves for ${Math.round(MOTION_FRACTION * 100)}% of each turn and dwells for the remaining ${Math.round((1 - MOTION_FRACTION) * 100)}%.`,
  ],
  applications: {
    summary: 'Precise indexing: move exactly one position, then hold still while work is done.',
    examples: [
      'Film advance in movie projectors',
      'Rotary indexing tables on assembly lines',
      'Pen changers in plotters',
    ],
  },
  referenceNote:
    'Brown #212 is the Geneva stop used in watches to limit winding. This model shows the continuous indexing form of the same slotted-wheel principle.',
  parts: [
    { role: 'driver', name: 'Crank with drive pin' },
    { role: 'intermediate', name: 'Locking disc' },
    { role: 'output', name: `${SLOTS}-slot Geneva wheel` },
    { role: 'frame', name: 'Shafts and frame' },
  ],
  keyframes: [
    { at: 0, label: 'Mid-index (pin deepest in slot)' },
    { at: ENGAGE_HALF_ANGLE / (Math.PI * 2), label: 'Pin leaves slot · wheel locks' },
    { at: 0.5, label: 'Mid-dwell' },
    { at: engageAt, label: 'Pin enters slot · wheel unlocks' },
  ],
  plot: {
    label: 'Wheel angle',
    unit: '°',
    sample: (t) => ((wheelAngle(t) - wheelAngle(0)) * 180) / Math.PI,
  },
  camera: { target: [0.7, 0, 0], distance: 7.4, width: 3.9, floorY: -1.53 },
  Model: lazy(() => import('./Model')),
};
