import type { Category, MechanismDefinition } from './types';

/** Case-insensitive search over title, number, motion tags, summary and examples. */
export function filterMechanisms(
  list: MechanismDefinition[],
  query: string,
  category: Category | 'All',
): MechanismDefinition[] {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  return list.filter((m) => {
    if (category !== 'All' && m.category !== category) return false;
    if (!q) return true;
    const haystack = [
      m.title,
      String(m.number),
      m.category,
      m.motion.from,
      m.motion.to,
      m.summary,
      ...m.applications.examples,
    ]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });
}
