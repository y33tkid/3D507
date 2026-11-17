import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { Vec2 } from '@/core/math';
import { extrudeOutline } from '@/core/shapes';
import { Part } from '@/viewer/Part';
import { RoleMaterial } from '@/viewer/RoleMaterial';
import { BackPlate, FixedShaft, ZCylinder } from '@/viewer/parts';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';
import {
  DRIVE_TIP_ANGLE,
  drivingPawl,
  HOLD_TIP_ANGLE,
  holdingPawl,
  leverAngle,
  PAWL_LENGTH,
  pawlPivot,
  PIVOT_LEAD,
  wheelAngle,
  wheelOutline,
} from './kinematics';

const PLATE = 0.16;
const LEVER_Z = PLATE / 2 + 0.07;
const HANDLE_RADIUS = 2.05;

/** Pawl in its own frame: pivot at the origin, tip at (L, 0). */
function pawlOutline(): Vec2[] {
  const L = PAWL_LENGTH;
  const pts: Vec2[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / 10;
    pts.push([0.1 * Math.cos(a), 0.1 * Math.sin(a)]);
  }
  pts.push([L * 0.55, -0.07], [L, -0.015], [L + 0.005, 0.02], [L * 0.6, 0.075]);
  return pts;
}

export default function RatchetModel() {
  const wheel = useRef<Group>(null);
  const lever = useRef<Group>(null);
  const drive = useRef<Group>(null);
  const hold = useRef<Group>(null);

  const wheelGeo = useMemo(
    () => extrudeOutline(wheelOutline(), PLATE, [{ c: [0, 0], r: 0.08 }]),
    [],
  );
  const pawlGeo = useMemo(
    () => extrudeOutline(pawlOutline(), PLATE * 0.9, [{ c: [0, 0], r: 0.035 }]),
    [],
  );
  const leverAngleOnArm = DRIVE_TIP_ANGLE - PIVOT_LEAD;
  const leverGeo = useMemo(() => {
    const a = leverAngleOnArm;
    const u: Vec2 = [Math.cos(a), Math.sin(a)];
    const v: Vec2 = [-u[1], u[0]];
    const p = (s: number, o: number): Vec2 => [u[0] * s + v[0] * o, u[1] * s + v[1] * o];
    return extrudeOutline(
      [
        p(-0.22, -0.1),
        p(HANDLE_RADIUS, -0.06),
        p(HANDLE_RADIUS + 0.07, 0),
        p(HANDLE_RADIUS, 0.06),
        p(-0.22, 0.1),
      ],
      0.08,
    );
  }, [leverAngleOnArm]);

  const restPivot = pawlPivot(DRIVE_TIP_ANGLE);
  const holdPivot = pawlPivot(HOLD_TIP_ANGLE);
  const handle: Vec2 = [
    Math.cos(leverAngleOnArm) * HANDLE_RADIUS,
    Math.sin(leverAngleOnArm) * HANDLE_RADIUS,
  ];

  usePhaseFrame((theta) => {
    wheel.current?.rotation.set(0, 0, wheelAngle(theta));
    lever.current?.rotation.set(0, 0, leverAngle(theta));
    const d = drivingPawl(theta);
    drive.current?.position.set(d.pivot[0], d.pivot[1], 0);
    drive.current?.rotation.set(0, 0, d.beta);
    const h = holdingPawl(theta);
    hold.current?.rotation.set(0, 0, h.beta);
  });

  return (
    <group>
      <BackPlate width={4.6} height={4} center={[0, 0.3]} />
      <FixedShaft x={0} y={0} zFront={LEVER_Z + 0.1} />
      <FixedShaft x={holdPivot[0]} y={holdPivot[1]} radius={0.035} name="Holding pawl pivot" />

      <group ref={wheel}>
        <Part role="output" name="Ratchet wheel">
          <mesh geometry={wheelGeo} castShadow receiveShadow>
            <RoleMaterial />
          </mesh>
          <ZCylinder
            position={[0, 0, 0]}
            radius={0.5}
            length={PLATE + 0.02}
            shade={1}
            segments={48}
          />
        </Part>
      </group>

      <group ref={lever}>
        <Part role="driver" name="Oscillating lever">
          <mesh geometry={leverGeo} position={[0, 0, LEVER_Z]} castShadow>
            <RoleMaterial />
          </mesh>
          <ZCylinder position={[0, 0, LEVER_Z]} radius={0.15} length={0.12} shade={1} />
          <ZCylinder
            position={[handle[0], handle[1], LEVER_Z + 0.2]}
            radius={0.09}
            length={0.4}
            shade={1}
          />
        </Part>
        <Part role="driver" name="Pawl pivot pin (on lever)">
          <ZCylinder
            position={[restPivot[0], restPivot[1], LEVER_Z / 2]}
            radius={0.035}
            length={LEVER_Z + 0.1}
          />
        </Part>
      </group>

      <group ref={drive}>
        <Part role="intermediate" name="Driving pawl">
          <mesh geometry={pawlGeo} castShadow>
            <RoleMaterial />
          </mesh>
        </Part>
      </group>

      <group position={[holdPivot[0], holdPivot[1], 0]}>
        <group ref={hold}>
          <Part role="intermediate" name="Holding pawl (detent)">
            <mesh geometry={pawlGeo} castShadow>
              <RoleMaterial />
            </mesh>
          </Part>
        </group>
      </group>
    </group>
  );
}
