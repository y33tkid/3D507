import { lazy } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { displacement } from './kinematics';

export const heartCam: MechanismDefinition = {
  id: 'heart-cam',
  number: 96,
  title: 'Cam and Follower (Heart Cam)',
  category: 'Cams',
  motion: { from: 'Rotary', to: 'Reciprocating' },
  summary: 'A heart-shaped cam lifts and lowers a roller follower at a perfectly steady speed.',
  howItWorks: [
    'The follower rests on the cam’s edge, so its height is set entirely by the cam’s profile: rotation goes in, and the profile decides the motion that comes out. Here the radius grows by the same amount for every degree of rotation, so the follower rises at constant speed for half a turn and falls at constant speed for the other half.',
    'The roller follower reduces sliding friction, and the cam surface is offset from the roller-centre path by exactly the roller radius. The sharp reversals at the top and bottom (the point and notch of the “heart”) mean an instantaneous change of direction, which is why high-speed cams use smoother curves.',
  ],
  applications: {
    summary: 'Any machine that needs a precise, repeatable motion timed to a rotating shaft.',
    examples: [
      'Engine valve trains (camshafts)',
      'Thread winding on sewing-machine bobbins and fishing reels',
      'Automatic lathes and packaging machines',
    ],
  },
  referenceNote:
    'Brown #96 describes how to lay out this heart cam for uniform reciprocating motion.',
  parts: [
    { role: 'driver', name: 'Heart cam and shaft' },
    { role: 'intermediate', name: 'Roller' },
    { role: 'output', name: 'Follower rod' },
    { role: 'frame', name: 'Guide bushing and frame' },
  ],
  keyframes: [
    { at: 0, label: 'Lowest point (notch)' },
    { at: 0.25, label: 'Rising at constant speed' },
    { at: 0.5, label: 'Highest point (tip)' },
    { at: 0.75, label: 'Falling at constant speed' },
  ],
  plot: { label: 'Follower lift', unit: 'units', sample: (t) => displacement(t) },
  camera: { target: [0, 0.75, 0], distance: 8.2, width: 3.4, floorY: -1.38 },
  Model: lazy(() => import('./Model')),
};
