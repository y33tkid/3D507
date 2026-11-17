import { DoubleSide, FrontSide, type MeshStandardMaterialParameters } from 'three';
import { ROLE_META } from '@/core/roles';
import type { PartRole } from '@/core/types';
import type { RenderMode } from '@/store/useAppStore';

/** Single source of truth for how a role looks in each render mode. */
export function roleMaterialProps(
  role: PartRole,
  mode: RenderMode,
  opts: { hovered?: boolean; shade?: number } = {},
): MeshStandardMaterialParameters {
  const color = ROLE_META[role].color;
  const translucent = mode === 'translucent';
  const isFrame = role === 'frame';
  return {
    color,
    metalness: isFrame ? 0.35 : 0.55,
    roughness: isFrame ? 0.65 : 0.38 + (opts.shade ?? 0) * 0.2,
    wireframe: mode === 'wireframe',
    transparent: translucent,
    opacity: translucent ? (isFrame ? 0.12 : 0.42) : 1,
    depthWrite: !translucent,
    side: translucent ? DoubleSide : FrontSide,
    emissive: color,
    emissiveIntensity: opts.hovered ? 0.45 : mode === 'wireframe' ? 0.6 : 0.02,
  };
}
