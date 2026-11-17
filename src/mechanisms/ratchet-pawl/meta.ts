import { lazy } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { SLACK, STEP, TEETH, wheelAngle } from './kinematics';

const slackAt = Math.acos(1 - (2 * SLACK) / (STEP + SLACK)) / (Math.PI * 2);

export const ratchetPawl: MechanismDefinition = {
  id: 'ratchet-pawl',
  number: 75,
  title: 'Ratchet and Pawl',
  category: 'Ratchets & Escapements',
  motion: { from: 'Oscillating', to: 'Intermittent one-way rotary' },
  summary: `A rocking lever and two pawls inch a ${TEETH}-tooth ratchet wheel forward one tooth at a time, and never back.`,
  howItWorks: [
    'Each tooth has a steep radial face and a gentle sloping back. On the forward stroke the driving pawl on the lever drops against a face and pushes the wheel round one tooth. On the return stroke it simply slides up the sloping backs and clicks into the next gap.',
    'Meanwhile the holding pawl on the frame rides over the teeth as the wheel advances, then drops behind a face. Any attempt to turn the wheel backwards jams a face against this pawl, which is set so the load pushes straight along it toward its pivot. That is why the wheel can only move one way.',
  ],
  applications: {
    summary:
      'Turning a back-and-forth motion into step-by-step rotation, or letting something turn one way only.',
    examples: ['Socket wrenches and winches', 'Bicycle freewheels', 'Clock winding and cable ties'],
  },
  referenceNote:
    'Brown #75 drives a ratchet wheel with a pawl on a vibrating arm. Here the arm is the input lever and a second, fixed pawl holds the wheel between strokes.',
  reverseNote:
    'Reverse rewinds the animation. The real wheel cannot turn backwards: the holding pawl would jam against a tooth face.',
  parts: [
    { role: 'driver', name: 'Oscillating lever' },
    { role: 'intermediate', name: 'Driving pawl' },
    { role: 'intermediate', name: 'Holding pawl (detent)' },
    { role: 'output', name: `Ratchet wheel (${TEETH} teeth)` },
    { role: 'frame', name: 'Pivots and frame' },
  ],
  keyframes: [
    { at: 0, label: 'Lever at rest · slack' },
    { at: slackAt, label: 'Driving pawl meets face' },
    { at: 0.5, label: 'End of stroke · holding pawl clicks in' },
    { at: 0.75, label: 'Return · driving pawl clicks over' },
  ],
  plot: {
    label: 'Wheel angle',
    unit: '°',
    sample: (t) => ((wheelAngle(t) - wheelAngle(0)) * 180) / Math.PI,
  },
  camera: { target: [0, 0.35, 0], distance: 7.6, width: 4.6, floorY: -1.78 },
  Model: lazy(() => import('./Model')),
};
