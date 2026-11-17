import { cycleFraction, cycleIndex, getTheta, setTheta, TAU } from '@/core/phase';
import type { MechanismDefinition } from '@/core/types';
import { SPEED_MAX, SPEED_MIN, useAppStore } from '@/store/useAppStore';
import { Icon } from './icons';
import { useTheta } from './useTheta';

const DEG = Math.PI / 180;

/** Move within the current cycle. Clamped below 1 so the right end never rolls into the next cycle. */
function jumpTo(fraction: number) {
  const k = cycleIndex(getTheta());
  const f = Math.min(Math.max(fraction, 0), 1 - 1e-6);
  setTheta((k + f) * TAU);
}

export function PlaybackBar({ mechanism }: { mechanism: MechanismDefinition }) {
  const playing = useAppStore((s) => s.playing);
  const speed = useAppStore((s) => s.speed);
  const reverse = useAppStore((s) => s.reverse);
  const togglePlaying = useAppStore((s) => s.togglePlaying);
  const setPlaying = useAppStore((s) => s.setPlaying);
  const setSpeed = useAppStore((s) => s.setSpeed);
  const toggleReverse = useAppStore((s) => s.toggleReverse);

  const theta = useTheta();
  const frac = cycleFraction(theta);
  const degrees = frac * 360;
  const keyframes = mechanism.keyframes ?? [];

  const step = (deg: number) => {
    setPlaying(false);
    setTheta(getTheta() + deg * DEG);
  };

  return (
    <div className="playback" role="group" aria-label="Animation controls">
      <div className="transport">
        <button
          type="button"
          className="icon-btn"
          onClick={() => step(-1)}
          aria-label="Step back 1°"
          title="Step back 1° (←)"
        >
          <Icon name="stepBack" />
        </button>
        <button
          type="button"
          className="icon-btn primary"
          onClick={togglePlaying}
          aria-label={playing ? 'Pause' : 'Play'}
          title="Play / pause (Space)"
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => step(1)}
          aria-label="Step forward 1°"
          title="Step forward 1° (→)"
        >
          <Icon name="stepFwd" />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-pressed={reverse}
          onClick={toggleReverse}
          aria-label="Reverse direction"
          title="Reverse (R)"
        >
          <Icon name="reverse" />
        </button>
      </div>

      <div className="scrubber">
        <div className="scrub-track">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={frac}
            aria-label="Cycle position"
            aria-valuetext={`${degrees.toFixed(0)} degrees`}
            onChange={(e) => {
              setPlaying(false);
              jumpTo(Number(e.target.value));
            }}
          />
          <div className="ticks" aria-hidden="true">
            {keyframes.map((k) => (
              <span key={k.label} className="tick" style={{ left: `${k.at * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="scrub-meta">
          <span className="mono readout" title="Input (driver) angle within the cycle">
            In {degrees.toFixed(1).padStart(5, ' ')}°
          </span>
          <span className="keyframes">
            {keyframes.map((k) => (
              <button
                type="button"
                key={k.label}
                className="kf"
                onClick={() => {
                  setPlaying(false);
                  jumpTo(k.at);
                }}
                title={`Jump to ${k.label}`}
              >
                <span className="mono">{Math.round(k.at * 360)}°</span> {k.label}
              </button>
            ))}
          </span>
        </div>
      </div>

      {reverse && mechanism.reverseNote && (
        <p className="reverse-note" role="note">
          {mechanism.reverseNote}
        </p>
      )}

      <label className="speed">
        <span className="mono">
          {reverse ? '−' : ''}
          {speed.toFixed(2)}×
        </span>
        <input
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Playback speed"
        />
      </label>
    </div>
  );
}
