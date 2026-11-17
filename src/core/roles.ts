import type { PartRole } from './types';

/**
 * Role colours. Keep in sync with --role-* tokens in styles/tokens.css
 * (see STYLEGUIDE.md › Colour).
 */
export const ROLE_META: Record<PartRole, { label: string; color: string; hint: string }> = {
  driver: { label: 'Input / driver', color: '#f2a33a', hint: 'Receives power from outside' },
  intermediate: { label: 'Intermediate', color: '#4f9cf0', hint: 'Transmits or transforms motion' },
  output: { label: 'Output', color: '#3fc28a', hint: 'Delivers the converted motion' },
  frame: { label: 'Frame', color: '#8592a3', hint: 'Fixed: bearings, guides, base' },
};

export const ROLE_ORDER: PartRole[] = ['driver', 'intermediate', 'output', 'frame'];
