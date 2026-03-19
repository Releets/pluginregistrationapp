export type QueueEntry = {
  id: string
  username: string
  estimated: number
  entered?: number
  exited?: number
}

export function isSame(a: QueueEntry, b: QueueEntry): boolean {
  // Queue entries are uniquely identified by the immutable userId stored in `id`.
  // Other fields (like `username` and `entered`) may change over time and should not be part of identity checks.
  return a.id === b.id
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
