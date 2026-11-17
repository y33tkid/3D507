import { useEffect } from 'react';
import { MECHANISMS, getMechanism } from '@/mechanisms';
import { useAppStore } from '@/store/useAppStore';

const PREFIX = '#/m/';

function idFromHash(): string | undefined {
  const h = window.location.hash;
  return h.startsWith(PREFIX) ? decodeURIComponent(h.slice(PREFIX.length)) : undefined;
}

/** Two-way sync between the selected mechanism and `#/m/<id>` (works on static hosting). */
export function useHashRoute(): void {
  const selectedId = useAppStore((s) => s.selectedId);
  const select = useAppStore((s) => s.select);

  useEffect(() => {
    const apply = () => {
      const id = idFromHash();
      select(id && getMechanism(id) ? id : (MECHANISMS[0]?.id ?? ''));
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [select]);

  useEffect(() => {
    if (selectedId && idFromHash() !== selectedId) {
      window.history.replaceState(null, '', `${PREFIX}${selectedId}`);
    }
  }, [selectedId]);
}
