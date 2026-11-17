import type { PartRole } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { usePart } from './partContext';
import { roleMaterialProps } from './roleMaterialProps';

interface RoleMaterialProps {
  /** Override the role inherited from the enclosing <Part>. */
  role?: PartRole;
  /** 0–1: slightly rougher finish for secondary surfaces (pins, hubs). */
  shade?: number;
}

/** Physically based material coloured by role and adapted to the render mode. */
export function RoleMaterial({ role: roleOverride, shade = 0 }: RoleMaterialProps) {
  const part = usePart();
  const role = roleOverride ?? part.role;
  const mode = useAppStore((s) => s.renderMode);
  const hovered = useAppStore((s) => part.name !== '' && s.hoveredPart?.name === part.name);
  return <meshStandardMaterial {...roleMaterialProps(role, mode, { hovered, shade })} />;
}
