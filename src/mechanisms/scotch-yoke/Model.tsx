import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { Vec2 } from '@/core/math';
import { extrudeOutline } from '@/core/shapes';
import { Part } from '@/viewer/Part';
import { RoleMaterial } from '@/viewer/RoleMaterial';
import { BackPlate, Box, FixedShaft, ZCylinder } from '@/viewer/parts';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';
import {
  CRANK_RADIUS,
  GUIDE_HALF_LENGTH,
  GUIDE_X,
  PIN_RADIUS,
  ROD_LENGTH,
  SLOT_HALF_LENGTH,
  SLOT_HALF_WIDTH,
  YOKE_HALF_WIDTH,
  yokeX,
} from './kinematics';

const ROD_Y = 0;

/** Yoke frame: a rectangle with a rounded slot through it. */
function yokeOutline(): { outer: Vec2[]; slot: Vec2[] } {
  const w = YOKE_HALF_WIDTH;
  const h = SLOT_HALF_LENGTH + 0.16;
  const outer: Vec2[] = [
    [-w, -h],
    [w, -h],
    [w, h],
    [-w, h],
  ];
  const slot: Vec2[] = [];
  const r = SLOT_HALF_WIDTH;
  const c = SLOT_HALF_LENGTH - r;
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (Math.PI * i) / 12;
    slot.push([r * Math.cos(a), -c + r * Math.sin(a)]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = (Math.PI * i) / 12;
    slot.push([r * Math.cos(a), c + r * Math.sin(a)]);
  }
  return { outer, slot };
}

export default function ScotchYokeModel() {
  const crank = useRef<Group>(null);
  const yoke = useRef<Group>(null);

  const yokeWithSlot = useMemo(() => {
    const { outer, slot } = yokeOutline();
    return extrudeOutline(outer, 0.18, [slot], 0);
  }, []);

  usePhaseFrame((theta) => {
    if (crank.current) crank.current.rotation.z = theta;
    if (yoke.current) yoke.current.position.x = yokeX(theta);
  });

  return (
    <group>
      <BackPlate width={7} height={3.4} center={[0, -0.1]} />
      <FixedShaft x={0} y={0} zFront={-0.1} />
      {/* rod guides */}
      <Part role="frame" name="Rod guide bushing">
        {[-GUIDE_X, GUIDE_X].map((x) => (
          <group key={x} position={[x, ROD_Y, 0.25]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.16, 0.16, GUIDE_HALF_LENGTH * 2, 32, 1, true]} />
              <RoleMaterial />
            </mesh>
            <Box position={[0, -0.82, -0.3]} size={[0.3, 1.5, 0.12]} />
          </group>
        ))}
      </Part>

      <group ref={crank}>
        <Part role="driver" name="Crank disc">
          <ZCylinder
            position={[0, 0, -0.05]}
            radius={CRANK_RADIUS + 0.25}
            length={0.1}
            segments={64}
          />
          <ZCylinder position={[0, 0, 0.0]} radius={0.16} length={0.22} shade={1} />
        </Part>
        <Part role="driver" name="Crank pin">
          <ZCylinder
            position={[CRANK_RADIUS, 0, 0.18]}
            radius={PIN_RADIUS}
            length={0.36}
            shade={1}
          />
        </Part>
      </group>

      <group ref={yoke} position={[0, 0, 0.25]}>
        <Part role="output" name="Slotted yoke">
          <mesh geometry={yokeWithSlot} castShadow receiveShadow>
            <RoleMaterial />
          </mesh>
        </Part>
        <Part role="output" name="Yoke rod">
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * (YOKE_HALF_WIDTH + ROD_LENGTH / 2), ROD_Y, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.11, 0.11, ROD_LENGTH, 24]} />
              <RoleMaterial />
            </mesh>
          ))}
        </Part>
      </group>
    </group>
  );
}
