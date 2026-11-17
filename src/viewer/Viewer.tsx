import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { SCENE } from '@/core/theme';
import type { MechanismDefinition } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { CameraRig } from './CameraRig';
import { ClockDriver } from './ClockDriver';

export function Viewer({ mechanism }: { mechanism: MechanismDefinition }) {
  const Model = mechanism.Model;
  const floorY = mechanism.camera.floorY;
  const clearHover = useAppStore((s) => s.setHoveredPart);

  return (
    <Canvas
      // three 0.187 removed PCFSoftShadowMap (fiber's `shadows` default); request PCF explicitly.
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.05, far: 200, position: [4, 3, 6] }}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => clearHover(null)}
      aria-label={`3D model of ${mechanism.title}`}
    >
      <color attach="background" args={[SCENE.background]} />
      <fog attach="fog" args={[SCENE.background, 14, 34]} />
      <hemisphereLight args={[SCENE.hemisphereSky, SCENE.hemisphereGround, 0.7]} />
      <directionalLight
        position={[4, 7, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5, 2, -4]} intensity={0.45} color={SCENE.rimLight} />
      {/* Local light-formers: no HDR download, works offline. */}
      <Environment resolution={128} environmentIntensity={0.5}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-6, 1, 3]} scale={[3, 6, 1]} />
        <Lightformer
          form="rect"
          intensity={0.6}
          color={SCENE.rimLight}
          position={[6, 2, -3]}
          scale={[3, 6, 1]}
        />
      </Environment>

      <ClockDriver />
      <CameraRig mechanism={mechanism} />

      <Suspense fallback={null}>
        <group key={mechanism.id}>
          <Model />
        </group>
      </Suspense>

      <ContactShadows
        position={[0, floorY + 0.005, 0]}
        opacity={0.45}
        scale={14}
        blur={2.4}
        far={5}
      />
      <Grid
        position={[0, floorY - 0.002, 0]}
        args={[40, 40]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor={SCENE.gridCell}
        sectionSize={1}
        sectionThickness={1}
        sectionColor={SCENE.gridSection}
        fadeDistance={26}
        fadeStrength={1.5}
        infiniteGrid
      />
    </Canvas>
  );
}
