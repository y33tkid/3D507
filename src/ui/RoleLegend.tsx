import { ROLE_META, ROLE_ORDER } from '@/core/roles';

/** Compact colour key overlaid on the viewport. */
export function RoleLegend() {
  return (
    <ul className="role-legend" aria-label="Colour key">
      {ROLE_ORDER.map((r) => (
        <li key={r} title={ROLE_META[r].hint}>
          <span className="swatch" style={{ background: ROLE_META[r].color }} />
          {ROLE_META[r].label}
        </li>
      ))}
    </ul>
  );
}
