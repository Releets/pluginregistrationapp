import type { QueueEntry, QueueEntryCurrent } from '../../../models/QueueEntry'
import { isCurrent } from '../../../models/QueueEntry'

export type StateUpdateSound = 'kick' | 'free'

export function getSoundToPlayForStateUpdate(
  previousHolder: QueueEntryCurrent | undefined,
  newState: QueueEntry[],
  privateKey: string
): StateUpdateSound | null {
  const newHolder = newState.find(entry => isCurrent(entry))

  if (!previousHolder) return null

  if (previousHolder.id === privateKey && newHolder?.id !== privateKey) {
    return 'kick'
  }
  if (newHolder?.id === privateKey && previousHolder.id !== privateKey) {
    return 'free'
  }
  return null
}
