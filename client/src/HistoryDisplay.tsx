import './styles/HistoryDisplay.css'
import { isExited, QueueEntry, QueueEntryExited } from '../../models/QueueEntry'
import { formatDateTime } from './utils/dateFormat'

export type HistoryDisplayProps = {
  data: QueueEntry[]
}

export default function HistoryDisplay(props: Readonly<HistoryDisplayProps>) {
  const { data } = props

  const historyQueue = data
    .filter(e => isExited(e))
    .sort((a, b) => b.exited - a.exited)
    .slice(0, 5)

  const opacity = (i: number) => 1 - i / (historyQueue.length - 0.5)

  return (
    <div className='historyDisplay'>
      <h2 style={{ color: 'white' }}>Logg</h2>
      {historyQueue.map((item, i) => (
        <div className='historyEntry' key={item.username + item.exited} style={{ opacity: opacity(i) }}>
          <HistoryEntry key={item.username} item={item} />
        </div>
      ))}
    </div>
  )
}

type HistoryEntryProps = {
  item: QueueEntryExited
}

function HistoryEntry(props: Readonly<HistoryEntryProps>) {
  const { item } = props

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div className='username'>{item.username}</div>
      <div className='timestamp'>{formatDateTime(item.exited)}</div>
    </div>
  )
}
