import { createContext, useContext } from 'react';
import type { PartRole } from '@/core/types';

export interface PartContextValue {
  role: PartRole;
  name: string;
}

export const PartContext = createContext<PartContextValue>({ role: 'frame', name: '' });

/** Role and name of the nearest enclosing <Part>. */
export function usePart(): PartContextValue {
  return useContext(PartContext);
}
