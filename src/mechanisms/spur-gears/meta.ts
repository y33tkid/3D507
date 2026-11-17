import { lazy } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { DRIVER, FOLLOWER, followerAngle } from './kinematics';

export const spurGears: MechanismDefinition = {
  id: 'spur-gears',
  number: 24,
  title: 'Spur Gears',
  category: 'Gears',
  motion: { from: 'Rotary', to: 'Rotary' },
  summary: `An ${DRIVER.teeth}-tooth pinion drives a ${FOLLOWER.teeth}-tooth gear: half the speed, twice the torque, opposite direction.`,
  howItWorks: [
    `Each tooth flank is an involute curve, so the point of contact always slides along one straight “line of action” tilted at the 20° pressure angle. Because the push always acts along that line, the speed ratio stays perfectly constant even as contact rolls from one tooth to the next.`,
    `The ratio equals the tooth count ratio: ${FOLLOWER.teeth} ÷ ${DRIVER.teeth} = ${FOLLOWER.teeth / DRIVER.teeth}:1. The large gear turns at half the pinion's speed in the opposite direction, and (ignoring friction) delivers twice the torque.`,
  ],
  applications: {
    summary: 'The default way to transmit power between parallel shafts with an exact speed ratio.',
    examples: [
      'Clock and watch trains',
      'Car gearboxes and differentials',
      'Kitchen mixers and power drills',
    ],
  },
  parts: [
    { role: 'driver', name: `Pinion (${DRIVER.teeth} teeth)` },
    { role: 'output', name: `Gear (${FOLLOWER.teeth} teeth)` },
    { role: 'frame', name: 'Shafts and frame' },
  ],
  keyframes: [
    { at: 0, label: 'Driver tooth on line of centres' },
    { at: 1 / DRIVER.teeth / 2, label: 'Half a tooth pitch' },
  ],
  plot: {
    label: 'Output gear angle',
    unit: '°',
    sample: (t) => ((followerAngle(t) - followerAngle(0)) * 180) / Math.PI,
  },
  camera: { target: [1.35, 0, 0], distance: 8.6, width: 6.5, floorY: -2.18 },
  Model: lazy(() => import('./Model')),
};
