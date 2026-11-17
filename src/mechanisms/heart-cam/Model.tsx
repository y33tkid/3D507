import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import { extrudeOutline } from '@/core/shapes';
import { Part } from '@/viewer/Part';
import { RoleMaterial } from '@/viewer/RoleMaterial';
import { BackPlate, Box, FixedShaft, ZCylinder } from '@/viewer/parts';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';
import { camOutline, LIFT, PRIME_RADIUS, ROLLER_RADIUS, rollerCenter } from './kinematics';

const PLATE = 0.22;
const ROD_LEN = 1.9;
const GUIDE_Y = PRIME_RADIUS + LIFT + 0.75;

export default function HeartCamModel() {
  const cam = useRef<Group>(null);
  const follower = useRef<Group>(null);
  const camGeo = useMemo(() => extrudeOutline(camOutline(), PLATE, [{ c: [0, 0], r: 0.08 }]), []);

  usePhaseFrame((theta) => {
    cam.current?.rotation.set(0, 0, theta);
    follower.current?.position.set(0, rollerCenter(theta)[1], 0);
  });

  return (
    <group>
      <BackPlate width={3.4} height={4.4} center={[0, 0.9]} />
      <FixedShaft x={0} y={0} />
      <Part role="frame" name="Follower guide">
        <mesh position={[0, GUIDE_Y, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.5, 32, 1, true]} />
          <RoleMaterial />
        </mesh>
        <Box position={[0, GUIDE_Y, -0.22]} size={[0.5, 0.35, 0.36]} />
      </Part>

      <group ref={cam}>
        <Part role="driver" name="Heart cam">
          <mesh geometry={camGeo} castShadow receiveShadow>
            <RoleMaterial />
          </mesh>
          <ZCylinder position={[0, 0, 0.1]} radius={0.18} length={PLATE + 0.06} shade={1} />
        </Part>
      </group>

      <group ref={follower}>
        <Part role="intermediate" name="Roller">
          <ZCylinder radius={ROLLER_RADIUS} length={PLATE * 0.8} shade={1} />
          <ZCylinder radius={0.04} length={PLATE + 0.22} />
        </Part>
        <Part role="output" name="Follower rod">
          <Box position={[0, 0.12, PLATE * 0.5 + 0.05]} size={[0.16, 0.36, 0.05]} />
          <Box position={[0, 0.12, -PLATE * 0.5 - 0.05]} size={[0.16, 0.36, 0.05]} />
          <mesh position={[0, 0.3 + ROD_LEN / 2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, ROD_LEN, 24]} />
            <RoleMaterial />
          </mesh>
        </Part>
      </group>
    </group>
  );
}
