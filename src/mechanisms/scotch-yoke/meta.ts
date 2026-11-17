import { lazy } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { yokeX } from './kinematics';

export const scotchYoke: MechanismDefinition = {
  id: 'scotch-yoke',
  number: 93,
  title: 'Scotch Yoke',
  category: 'Linkages',
  motion: { from: 'Rotary', to: 'Reciprocating' },
  summary:
    'A crank pin sliding in a slotted yoke turns steady rotation into pure harmonic back-and-forth motion.',
  howItWorks: [
    'The crank pin travels in a circle, but the yoke can only slide sideways, so it picks up just the horizontal part of the pin’s position: x = R·cos θ. The vertical part is absorbed by the pin sliding up and down the slot.',
    'The result is exact simple harmonic motion: the yoke stops momentarily at each end (the dead centres at 0° and 180°) and moves fastest at 90° and 270°. Force passes from the pin to the slot wall, so the slot wears and the pin must be well lubricated.',
  ],
  applications: {
    summary:
      'Compact rotary-to-linear conversion where smooth sinusoidal motion matters more than wear.',
    examples: [
      'Valve actuators in pipelines',
      'Shake tables and vibration testers',
      'Some small steam engines and pumps',
    ],
  },
  referenceNote:
    'Brown #93 shows the same crank-in-slotted-yoke arrangement “dispensing with the connecting rod”.',
  parts: [
    { role: 'driver', name: 'Crank disc and pin' },
    { role: 'output', name: 'Slotted yoke and rods' },
    { role: 'frame', name: 'Guide bushings and frame' },
  ],
  keyframes: [
    { at: 0, label: 'Outer dead centre (x = +R)' },
    { at: 0.25, label: 'Maximum speed' },
    { at: 0.5, label: 'Inner dead centre (x = −R)' },
    { at: 0.75, label: 'Maximum speed (return)' },
  ],
  plot: { label: 'Yoke displacement', unit: 'R', sample: (t) => yokeX(t) },
  camera: { target: [0.4, 0, 0], distance: 9, width: 7, floorY: -1.88 },
  Model: lazy(() => import('./Model')),
};
