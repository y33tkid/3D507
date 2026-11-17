import { forwardRef, useMemo } from 'react';
import { filterMechanisms } from '@/core/filter';
import { CATEGORIES } from '@/core/types';
import { MECHANISMS } from '@/mechanisms';
import { useAppStore } from '@/store/useAppStore';
import { Icon } from './icons';

interface CatalogueProps {
  onPick?: () => void;
}

/** Searchable, filterable list of movements. */
export const Catalogue = forwardRef<HTMLInputElement, CatalogueProps>(function Catalogue(
  { onPick },
  searchRef,
) {
  const query = useAppStore((s) => s.query);
  const category = useAppStore((s) => s.category);
  const selectedId = useAppStore((s) => s.selectedId);
  const setQuery = useAppStore((s) => s.setQuery);
  const setCategory = useAppStore((s) => s.setCategory);

  const results = useMemo(() => filterMechanisms(MECHANISMS, query, category), [query, category]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c, filterMechanisms(MECHANISMS, query, c).length]),
      ) as Record<string, number>,
    [query],
  );

  return (
    <nav className="catalogue" aria-label="Mechanism catalogue">
      <label className="search">
        <Icon name="search" />
        <span className="visually-hidden">Search mechanisms</span>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search movements, #number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <kbd>/</kbd>
      </label>

      <div className="chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className="chip"
          aria-pressed={category === 'All'}
          onClick={() => setCategory('All')}
        >
          All{' '}
          <span className="chip-count">{filterMechanisms(MECHANISMS, query, 'All').length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            disabled={counts[c] === 0 && category !== c}
          >
            {c} <span className="chip-count">{counts[c]}</span>
          </button>
        ))}
      </div>

      <ul className="mech-list">
        {results.map((m) => (
          <li key={m.id}>
            <a
              href={`#/m/${m.id}`}
              className="mech-card"
              aria-current={m.id === selectedId ? 'page' : undefined}
              onClick={onPick}
            >
              <span className="mech-no">#{m.number}</span>
              <span className="mech-body">
                <span className="mech-title">{m.title}</span>
                <span className="mech-motion">
                  {m.motion.from} → {m.motion.to}
                </span>
              </span>
            </a>
          </li>
        ))}
        {results.length === 0 && <li className="empty">No movements match “{query}”.</li>}
      </ul>

      <p className="catalogue-foot">
        {MECHANISMS.length} of 507 movements modelled · numbering follows H. T. Brown (1868)
      </p>
    </nav>
  );
});
