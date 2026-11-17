import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { Vec2 } from '@/core/math';
import { extrudeOutline } from '@/core/shapes';
import { SCENE } from '@/core/theme';
import { Part } from '@/viewer/Part';
import { RoleMaterial } from '@/viewer/RoleMaterial';
import { BackPlate, FixedShaft, ZCylinder } from '@/viewer/parts';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';
import { CENTER_DISTANCE, DRIVER, FOLLOWER, followerAngle, gearOutline } from './kinematics';

const FACE = 0.3;
const LIGHTENING_HOLES: Vec2[] = [0, 1, 2, 3, 4].map((i) => {
  const a = Math.PI / 5 + (i / 5) * Math.PI * 2;
  return [Math.cos(a) * 0.98, Math.sin(a) * 0.98];
});

export default function SpurGearsModel() {
  const driver = useRef<Group>(null);
  const follower = useRef<Group>(null);

  const driverGeo = useMemo(
    () => extrudeOutline(gearOutline(DRIVER), FACE, [{ c: [0, 0], r: 0.08 }]),
    [],
  );
  const followerGeo = useMemo(
    () =>
      extrudeOutline(gearOutline(FOLLOWER), FACE, [
        { c: [0, 0], r: 0.08 },
        // five lightening holes, so the X-ray view shows real openings
        ...LIGHTENING_HOLES.map((c) => ({ c, r: 0.24 })),
      ]),
    [],
  );

  usePhaseFrame((theta) => {
    if (driver.current) driver.current.rotation.z = theta;
    if (follower.current) follower.current.rotation.z = followerAngle(theta);
  });

  return (
    <group>
      <BackPlate width={6.5} height={4.2} center={[CENTER_DISTANCE / 2, 0]} />
      <FixedShaft x={0} y={0} />
      <FixedShaft x={CENTER_DISTANCE} y={0} />

      <group ref={driver}>
        <Part role="driver" name={`Pinion · ${DRIVER.teeth} teeth`}>
          <mesh geometry={driverGeo} castShadow receiveShadow>
            <RoleMaterial />
          </mesh>
          <ZCylinder position={[0, 0, 0.2]} radius={0.22} length={0.12} shade={1} />
          {/* index mark so rotation is readable */}
          <mesh position={[0.45, 0, FACE / 2 + 0.005]}>
            <boxGeometry args={[0.35, 0.05, 0.01]} />
            <meshBasicMaterial color={SCENE.marking} />
          </mesh>
        </Part>
      </group>

      <group position={[CENTER_DISTANCE, 0, 0]}>
        <group ref={follower}>
          <Part role="output" name={`Gear · ${FOLLOWER.teeth} teeth`}>
            <mesh geometry={followerGeo} castShadow receiveShadow>
              <RoleMaterial />
            </mesh>
            <ZCylinder position={[0, 0, 0.2]} radius={0.28} length={0.12} shade={1} />
            <mesh position={[-1.35, 0, FACE / 2 + 0.005]}>
              <boxGeometry args={[0.45, 0.05, 0.01]} />
              <meshBasicMaterial color={SCENE.marking} />
            </mesh>
          </Part>
        </group>
      </group>
    </group>
  );
}
