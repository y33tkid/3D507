import { useMemo, type ReactNode } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { PartRole } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { PartContext } from './partContext';

interface PartProps {
  role: PartRole;
  name: string;
  children: ReactNode;
}

/**
 * Semantic wrapper for a physical part. Children using <RoleMaterial /> pick up
 * the role colour, and hovering reports the part name to the HUD.
 */
export function Part({ role, name, children }: PartProps) {
  const setHovered = useAppStore((s) => s.setHoveredPart);
  const value = useMemo(() => ({ role, name }), [role, name]);
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered({ role, name });
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
  };
  return (
    <PartContext.Provider value={value}>
      <group onPointerOver={over} onPointerOut={out}>
        {children}
      </group>
    </PartContext.Provider>
  );
}
