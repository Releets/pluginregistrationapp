export type QueueEntry = {
  id: string
  username: string
  estimated: number
  entered?: number
  exited?: number
}

export function isSame(a: QueueEntry, b: QueueEntry): boolean {
  return a.id === b.id && a.username === b.username && a.entered === b.entered
}

export type QueueEntryPending = QueueEntry & { exited: undefined }

/**
 * Checks if a given queue entry is currently in the queue.
 */
export function isPending(entry: QueueEntry): entry is QueueEntryPending {
  return entry.exited === undefined
}

export type QueueEntryCurrent = QueueEntry & {
  entered: number
  exited: undefined
}
/**
 * Checks if a given entry is the current holder.
 */
export function isCurrent(entry: QueueEntry): entry is QueueEntryCurrent {
  return entry.exited === undefined && entry.entered !== undefined
}

export type QueueEntryExited = QueueEntry & { exited: number }
export function isExited(entry: QueueEntry): entry is QueueEntryExited {
  return entry.exited !== undefined
}
