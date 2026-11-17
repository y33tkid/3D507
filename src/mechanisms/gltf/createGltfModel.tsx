/**
 * Adapter for mechanisms authored in a modelling tool and exported as .glb/.gltf.
 *
 * Geometry comes from the file; motion still comes from a pure function of θ,
 * so play, reverse, speed and the scrubber behave exactly as for procedural
 * models. Name the moving nodes in your modelling tool and map them below.
 *
 *   // src/mechanisms/my-movement/Model.tsx
 *   export default createGltfModel({
 *     url: `${import.meta.env.BASE_URL}models/my-movement.glb`,
 *     roles: { Crank: 'driver', Rod: 'intermediate', Slider: 'output', Base: 'frame' },
 *     pose: (theta) => ({
 *       Crank: { rotation: [0, 0, theta] },
 *       Slider: { position: [Math.cos(theta), 0, 0] },
 *     }),
 *   });
 */
import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { Mesh, MeshStandardMaterial, type Object3D } from 'three';
import type { MechanismModelProps, PartRole } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { roleMaterialProps } from '@/viewer/roleMaterialProps';
import { usePhaseFrame } from '@/viewer/usePhaseFrame';

type V3 = [number, number, number];

export interface NodePose {
  position?: V3;
  rotation?: V3;
}

export interface GltfModelOptions {
  url: string;
  /** Node name → role. Meshes under unlisted nodes keep their authored materials. */
  roles?: Record<string, PartRole>;
  /** Pure function of θ returning poses for named nodes. */
  pose: (theta: number) => Record<string, NodePose>;
  scale?: number;
}

export function createGltfModel(options: GltfModelOptions) {
  function GltfModel(_props: MechanismModelProps) {
    const { scene } = useGLTF(options.url);
    const root = useMemo(() => scene.clone(true), [scene]);
    const mode = useAppStore((s) => s.renderMode);

    const nodes = useMemo(() => {
      const map: Record<string, Object3D> = {};
      root.traverse((o) => {
        if (o.name) map[o.name] = o;
      });
      return map;
    }, [root]);

    // Apply role materials, and re-apply when the render mode changes.
    useEffect(() => {
      const created: MeshStandardMaterial[] = [];
      for (const [name, role] of Object.entries(options.roles ?? {})) {
        nodes[name]?.traverse((o) => {
          if (o instanceof Mesh) {
            // Lit materials need normals; some exporters omit them.
            if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
            const mat = new MeshStandardMaterial(roleMaterialProps(role, mode));
            created.push(mat);
            o.material = mat;
          }
        });
      }
      return () => created.forEach((m) => m.dispose());
    }, [nodes, mode]);

    usePhaseFrame((theta) => {
      for (const [name, p] of Object.entries(options.pose(theta))) {
        const node = nodes[name];
        if (!node) continue;
        if (p.position) node.position.set(...p.position);
        if (p.rotation) node.rotation.set(...p.rotation);
      }
    });

    return <primitive object={root} scale={options.scale ?? 1} />;
  }
  return GltfModel;
}
