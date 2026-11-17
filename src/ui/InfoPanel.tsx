import { ROLE_META, ROLE_ORDER } from '@/core/roles';
import type { MechanismDefinition } from '@/core/types';
import { useAppStore } from '@/store/useAppStore';
import { Icon } from './icons';
import { MotionPlot } from './MotionPlot';
import { SHORTCUTS } from './useKeyboardShortcuts';

const sourceUrl = (n: number) => `https://507movements.com/mm_${String(n).padStart(3, '0')}.html`;

export function InfoPanel({ mechanism: m }: { mechanism: MechanismDefinition }) {
  const togglePanel = useAppStore((s) => s.togglePanel);
  const hovered = useAppStore((s) => s.hoveredPart);
  const roles = ROLE_ORDER.filter((r) => m.parts.some((p) => p.role === r));

  return (
    <aside className="info" aria-label="Mechanism details">
      <header className="info-head">
        <div>
          <p className="eyebrow">
            Movement <span className="mono">#{m.number}</span> · {m.category}
          </p>
          <h1>{m.title}</h1>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={togglePanel}
          aria-label="Hide details panel"
        >
          <Icon name="close" />
        </button>
      </header>

      <p className="motion-tag">
        <span>{m.motion.from}</span>
        <span aria-label="to">→</span>
        <span>{m.motion.to}</span>
      </p>

      <p className="lede">{m.summary}</p>

      <section>
        <h2>How it works</h2>
        {m.howItWorks.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      {m.plot && <MotionPlot plot={m.plot} />}

      <section>
        <h2>Parts</h2>
        <ul className="legend">
          {roles.map((role) => (
            <li key={role}>
              <span className="swatch" style={{ background: ROLE_META[role].color }} />
              <span>
                <strong>{ROLE_META[role].label}</strong>
                <span className="muted">
                  {' '}
                  —{' '}
                  {m.parts
                    .filter((p) => p.role === role)
                    .map((p) => p.name)
                    .join(', ')}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="hint" aria-live="polite">
          {hovered ? (
            <>
              Pointing at:{' '}
              <strong style={{ color: ROLE_META[hovered.role].color }}>{hovered.name}</strong>
            </>
          ) : (
            'Hover a part in the viewer to name it.'
          )}
        </p>
      </section>

      <section>
        <h2>Real-world applications</h2>
        <p>{m.applications.summary}</p>
        <ul className="examples">
          {m.applications.examples.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>

      <section className="reference">
        <h2>Source</h2>
        {m.referenceNote && <p>{m.referenceNote}</p>}
        <a href={sourceUrl(m.number)} target="_blank" rel="noreferrer noopener">
          Brown’s movement #{m.number} on 507movements.com{' '}
          <Icon name="external" width={14} height={14} />
        </a>
      </section>

      <details className="shortcuts">
        <summary>Keyboard shortcuts</summary>
        <dl>
          {SHORTCUTS.map(([k, d]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </details>
    </aside>
  );
}
