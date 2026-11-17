import { useRef, useState } from 'react';
import { getMechanism, MECHANISMS } from '@/mechanisms';
import { useAppStore } from '@/store/useAppStore';
import { Catalogue } from '@/ui/Catalogue';
import { Icon } from '@/ui/icons';
import { InfoPanel } from '@/ui/InfoPanel';
import { PlaybackBar } from '@/ui/PlaybackBar';
import { RoleLegend } from '@/ui/RoleLegend';
import { useHashRoute } from '@/ui/useHashRoute';
import { useKeyboardShortcuts } from '@/ui/useKeyboardShortcuts';
import { ViewToolbar } from '@/ui/ViewToolbar';
import { Viewer } from '@/viewer/Viewer';

export default function App() {
  useHashRoute();
  const searchRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts(searchRef);

  const selectedId = useAppStore((s) => s.selectedId);
  const panelOpen = useAppStore((s) => s.panelOpen);
  const togglePanel = useAppStore((s) => s.togglePanel);
  const [navOpen, setNavOpen] = useState(false);

  const mechanism = getMechanism(selectedId) ?? MECHANISMS[0];
  if (!mechanism) return null;

  return (
    <div
      className="app"
      data-panel={panelOpen ? 'open' : 'closed'}
      data-nav={navOpen ? 'open' : 'closed'}
    >
      <header className="topbar">
        <button
          type="button"
          className="icon-btn nav-toggle"
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Toggle catalogue"
          aria-expanded={navOpen}
        >
          <Icon name={navOpen ? 'close' : 'menu'} />
        </button>
        <a className="brand" href={`#/m/${MECHANISMS[0]?.id ?? ''}`}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            507 <span className="muted">Mechanical Movements</span>{' '}
            <span className="brand-3d">3D</span>
          </span>
        </a>
        <span className="topbar-current mono">
          #{mechanism.number} {mechanism.title}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={togglePanel}
          aria-label={panelOpen ? 'Hide details' : 'Show details'}
          aria-pressed={panelOpen}
          title="Details panel"
        >
          <Icon name="panel" />
        </button>
      </header>

      <Catalogue ref={searchRef} onPick={() => setNavOpen(false)} />
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <main className="stage">
        <div className="canvas-wrap">
          <Viewer mechanism={mechanism} />
        </div>
        <div className="overlay-top">
          <ViewToolbar />
        </div>
        <RoleLegend />
        <div className="overlay-bottom">
          <PlaybackBar mechanism={mechanism} />
        </div>
      </main>

      {panelOpen && <InfoPanel mechanism={mechanism} />}
    </div>
  );
}
