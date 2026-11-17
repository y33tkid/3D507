/**
 * The mechanism registry. To add a movement, create a folder next to this file
 * (see docs/ADDING_A_MECHANISM.md) and append its definition here.
 * Order here is the default order in the catalogue (by Brown's number).
 */
import type { MechanismDefinition } from '@/core/types';
import { genevaDrive } from './geneva-drive/meta';
import { heartCam } from './heart-cam/meta';
import { ratchetPawl } from './ratchet-pawl/meta';
import { scotchYoke } from './scotch-yoke/meta';
import { spurGears } from './spur-gears/meta';

export const MECHANISMS: MechanismDefinition[] = [
  spurGears,
  ratchetPawl,
  scotchYoke,
  heartCam,
  genevaDrive,
].sort((a, b) => a.number - b.number);

export function getMechanism(id: string): MechanismDefinition | undefined {
  return MECHANISMS.find((m) => m.id === id);
}
