import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { extrudeOutline } from '@/core/shapes';
import { Part } from '@/viewer/Part';
import { RoleMaterial } from '@/viewer/RoleMaterial';
import { BackPlate, FixedShaft, ZCylinder } from '@/viewer/parts';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';
import {
  CENTER_DISTANCE,
  CRANK_RADIUS,
  lockingDiscOutline,
  PIN_RADIUS,
  wheelOutline,
  wheelRotation,
} from './kinematics';

const PLATE = 0.16;
/** Wheel and locking disc share a plane; the crank arm sits in front of it. */
const ARM_Z = PLATE / 2 + 0.06;

export default function GenevaModel() {
  const driver = useRef<Group>(null);
  const wheel = useRef<Group>(null);

  const wheelGeo = useMemo(
    () => extrudeOutline(wheelOutline(), PLATE, [{ c: [0, 0], r: 0.08 }]),
    [],
  );
  const discGeo = useMemo(
    () => extrudeOutline(lockingDiscOutline(), PLATE, [{ c: [0, 0], r: 0.08 }]),
    [],
  );
  const armGeo = useMemo(
    () =>
      extrudeOutline(
        [
          [-0.16, -0.14],
          [CRANK_RADIUS, -0.12],
          [CRANK_RADIUS + 0.12, 0],
          [CRANK_RADIUS, 0.12],
          [-0.16, 0.14],
          [-0.24, 0],
        ],
        0.08,
      ),
    [],
  );

  usePhaseFrame((theta) => {
    if (driver.current) driver.current.rotation.z = theta;
    if (wheel.current) wheel.current.rotation.z = wheelRotation(theta);
  });

  return (
    <group>
      <BackPlate width={3.9} height={2.9} center={[CENTER_DISTANCE / 2, 0]} />
      <FixedShaft x={0} y={0} zFront={0.3} />
      <FixedShaft x={CENTER_DISTANCE} y={0} />

      <group ref={driver}>
        <Part role="intermediate" name="Locking disc">
          <mesh geometry={discGeo} castShadow receiveShadow>
            <RoleMaterial />
          </mesh>
        </Part>
        <Part role="driver" name="Crank arm">
          <mesh geometry={armGeo} position={[0, 0, ARM_Z]} castShadow>
            <RoleMaterial />
          </mesh>
          <ZCylinder position={[0, 0, ARM_Z]} radius={0.17} length={0.12} shade={1} />
        </Part>
        <Part role="driver" name="Drive pin">
          <ZCylinder
            position={[CRANK_RADIUS, 0, ARM_Z / 2]}
            radius={PIN_RADIUS}
            length={ARM_Z + PLATE / 2 + 0.04}
            shade={1}
          />
        </Part>
      </group>

      <group position={[CENTER_DISTANCE, 0, 0]}>
        <group ref={wheel}>
          <Part role="output" name="Geneva wheel">
            <mesh geometry={wheelGeo} castShadow receiveShadow>
              <RoleMaterial />
            </mesh>
            <ZCylinder position={[0, 0, PLATE / 2 + 0.03]} radius={0.16} length={0.08} shade={1} />
          </Part>
        </group>
      </group>
    </group>
  );
}
