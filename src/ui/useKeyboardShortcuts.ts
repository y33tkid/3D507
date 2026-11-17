import { useEffect } from 'react';
import { advanceTheta } from '@/core/phase';
import { useAppStore } from '@/store/useAppStore';

const DEG = Math.PI / 180;

export const SHORTCUTS: [string, string][] = [
  ['Space', 'Play / pause'],
  ['R', 'Reverse direction'],
  ['← →', 'Step 1° (Shift: 10°)'],
  ['[ ]', 'Slower / faster'],
  ['1–4', 'Iso / front / top / side view'],
  ['0', 'Reset view'],
  ['W', 'Cycle solid / translucent / wireframe'],
  ['/', 'Search'],
];

/** Global keyboard shortcuts. Ignored while typing in a field. */
export function useKeyboardShortcuts(searchRef: React.RefObject<HTMLInputElement>): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        if (e.key === 'Escape') t.blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useAppStore.getState();
      const step = (e.shiftKey ? 10 : 1) * DEG;
      switch (e.key) {
        case ' ':
          s.togglePlaying();
          break;
        case 'r':
        case 'R':
          s.toggleReverse();
          break;
        case 'ArrowLeft':
          s.setPlaying(false);
          advanceTheta(-step);
          break;
        case 'ArrowRight':
          s.setPlaying(false);
          advanceTheta(step);
          break;
        case '[':
          s.setSpeed(+(s.speed - 0.1).toFixed(2));
          break;
        case ']':
          s.setSpeed(+(s.speed + 0.1).toFixed(2));
          break;
        case '1':
          s.requestCamera('iso');
          break;
        case '2':
          s.requestCamera('front');
          break;
        case '3':
          s.requestCamera('top');
          break;
        case '4':
          s.requestCamera('side');
          break;
        case '0':
          s.requestCamera('reset');
          break;
        case 'w':
        case 'W':
          s.cycleRenderMode();
          break;
        case '/':
          searchRef.current?.focus();
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchRef]);
}
