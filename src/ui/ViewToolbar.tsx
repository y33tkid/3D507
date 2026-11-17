import { useAppStore, type CameraPreset, type RenderMode } from '@/store/useAppStore';
import { Icon } from './icons';

const PRESETS: [CameraPreset, string, string][] = [
  ['iso', 'Iso', '1'],
  ['front', 'Front', '2'],
  ['top', 'Top', '3'],
  ['side', 'Side', '4'],
];
const MODES: [RenderMode, string][] = [
  ['solid', 'Solid'],
  ['translucent', 'X-ray'],
  ['wireframe', 'Wire'],
];

export function ViewToolbar() {
  const requestCamera = useAppStore((s) => s.requestCamera);
  const mode = useAppStore((s) => s.renderMode);
  const setMode = useAppStore((s) => s.setRenderMode);

  return (
    <div className="toolbar" role="toolbar" aria-label="View">
      <div className="seg" role="group" aria-label="Camera presets">
        {PRESETS.map(([p, label, key]) => (
          <button
            key={p}
            type="button"
            onClick={() => requestCamera(p)}
            title={`${label} view (${key})`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => requestCamera('reset')}
          title="Reset view (0)"
          aria-label="Reset view"
        >
          <Icon name="reset" width={16} height={16} />
        </button>
      </div>
      <div className="seg" role="group" aria-label="Render mode">
        {MODES.map(([m, label]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            title={`${label} (W cycles)`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
