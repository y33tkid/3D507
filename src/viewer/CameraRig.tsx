import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { MechanismDefinition } from '@/core/types';
import { useAppStore, type CameraPreset } from '@/store/useAppStore';

/** Unit-ish view directions. Mechanisms are modelled in the XY plane, facing +Z. */
const DIRECTIONS: Record<CameraPreset, [number, number, number]> = {
  iso: [0.62, 0.45, 0.82],
  front: [0, 0, 1],
  top: [0, 1, 0.0001],
  side: [1, 0, 0],
};

export function CameraRig({ mechanism }: { mechanism: MechanismDefinition }) {
  const controls = useRef<CameraControls>(null);
  const request = useAppStore((s) => s.cameraRequest);
  const first = useRef(true);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const fov = useThree((s) => ('fov' in s.camera ? (s.camera.fov as number) : 40));

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const preset = request.preset === 'reset' ? 'iso' : request.preset;
    const [dx, dy, dz] = DIRECTIONS[preset];
    const len = Math.hypot(dx, dy, dz);
    const { target, distance, width } = mechanism.camera;
    const [tx, ty, tz] = target;
    // Back off on narrow stages so the whole width (plus a margin) stays in view.
    const halfFov = ((fov / 2) * Math.PI) / 180;
    const fitWidth = (width * 0.55) / (Math.tan(halfFov) * aspect) + 1;
    const k = Math.max(distance, fitWidth) / len;
    void c.setLookAt(tx + dx * k, ty + dy * k, tz + dz * k, tx, ty, tz, !first.current);
    first.current = false;
    // aspect is read on purpose but only re-frames on explicit requests
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, mechanism]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.2}
      maxDistance={20}
      smoothTime={0.35}
      draggingSmoothTime={0.08}
    />
  );
}
