import type { QueueEntry, QueueEntryCurrent } from '../../../models/QueueEntry'
import { isCurrent } from '../../../models/QueueEntry'

export type StateUpdateSound = 'kick' | 'free'

export function getSoundToPlayForStateUpdate(
  previousHolder: QueueEntryCurrent | undefined,
  newState: QueueEntry[],
  userId: string | null
): StateUpdateSound | null {
  if (!userId) return null
  const newHolder = newState.find(entry => isCurrent(entry))

  if (!previousHolder) return null

  if (previousHolder.id === userId && newHolder?.id !== userId) {
    return 'kick'
  }
  if (newHolder?.id === userId && previousHolder.id !== userId) {
    return 'free'
  }
  return null
}
