/** Reusable primitive parts (shafts, bearings, plates) for procedural models. */
import type { ReactNode } from 'react';
import { Part } from './Part';
import { RoleMaterial } from './RoleMaterial';

type V3 = [number, number, number];

/** A cylinder along the Z axis. */
export function ZCylinder({
  position = [0, 0, 0],
  radius,
  length,
  segments = 32,
  shade,
}: {
  position?: V3;
  radius: number;
  length: number;
  segments?: number;
  shade?: number;
}) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, segments]} />
      <RoleMaterial shade={shade} />
    </mesh>
  );
}

export function Box({ position, size, rotation }: { position: V3; size: V3; rotation?: V3 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <RoleMaterial />
    </mesh>
  );
}

/** Fixed shaft with a bearing block behind the mechanism plane. */
export function FixedShaft({
  x,
  y,
  zBack = -0.35,
  zFront = 0.2,
  radius = 0.07,
  name = 'Shaft bearing',
}: {
  x: number;
  y: number;
  zBack?: number;
  zFront?: number;
  radius?: number;
  name?: string;
}) {
  const len = zFront - zBack;
  return (
    <Part role="frame" name={name}>
      <ZCylinder position={[x, y, zBack + len / 2]} radius={radius} length={len} />
      <ZCylinder position={[x, y, zBack]} radius={radius * 2.4} length={0.1} />
    </Part>
  );
}

/** Upright back plate that carries the shafts, plus a foot. */
export function BackPlate({
  width,
  height,
  center = [0, 0],
  z = -0.42,
  children,
}: {
  width: number;
  height: number;
  center?: [number, number];
  z?: number;
  children?: ReactNode;
}) {
  return (
    <Part role="frame" name="Frame plate">
      <Box position={[center[0], center[1], z]} size={[width, height, 0.06]} />
      <Box
        position={[center[0], center[1] - height / 2 - 0.04, z + 0.35]}
        size={[width, 0.08, 0.8]}
      />
      {children}
    </Part>
  );
}
