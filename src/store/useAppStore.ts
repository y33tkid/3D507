import { create } from 'zustand';
import type { Category, PartRole } from '@/core/types';

export type RenderMode = 'solid' | 'translucent' | 'wireframe';
export type CameraPreset = 'iso' | 'front' | 'top' | 'side';

export const SPEED_MIN = 0.1;
export const SPEED_MAX = 2;
/** Seconds per driver cycle at 1× speed. */
export const SECONDS_PER_CYCLE = 4;

interface AppState {
  selectedId: string;
  playing: boolean;
  speed: number;
  reverse: boolean;
  renderMode: RenderMode;
  /** Increments to ask the camera rig to move; `preset: null` means reset. */
  cameraRequest: { preset: CameraPreset | 'reset'; nonce: number };
  panelOpen: boolean;
  query: string;
  hoveredPart: { role: PartRole; name: string } | null;
  category: Category | 'All';

  select: (id: string) => void;
  togglePlaying: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  toggleReverse: () => void;
  setRenderMode: (mode: RenderMode) => void;
  cycleRenderMode: () => void;
  requestCamera: (preset: CameraPreset | 'reset') => void;
  togglePanel: () => void;
  setQuery: (q: string) => void;
  setHoveredPart: (p: { role: PartRole; name: string } | null) => void;
  setCategory: (c: Category | 'All') => void;
}

const MODES: RenderMode[] = ['solid', 'translucent', 'wireframe'];

export const useAppStore = create<AppState>()((set) => ({
  selectedId: '',
  // Respect reduced-motion users: start paused, they can press play.
  playing: !(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ),
  speed: 1,
  reverse: false,
  renderMode: 'solid',
  cameraRequest: { preset: 'reset', nonce: 0 },
  panelOpen: true,
  query: '',
  hoveredPart: null,
  category: 'All',

  select: (id) => set({ selectedId: id }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed: Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed)) }),
  toggleReverse: () => set((s) => ({ reverse: !s.reverse })),
  setRenderMode: (renderMode) => set({ renderMode }),
  cycleRenderMode: () =>
    set((s) => ({ renderMode: MODES[(MODES.indexOf(s.renderMode) + 1) % MODES.length]! })),
  requestCamera: (preset) =>
    set((s) => ({ cameraRequest: { preset, nonce: s.cameraRequest.nonce + 1 } })),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  setQuery: (query) => set({ query }),
  setHoveredPart: (hoveredPart) => set({ hoveredPart }),
  setCategory: (category) => set({ category }),
}));
