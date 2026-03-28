import './styles/HistoryDisplay.css'
import { isExited, QueueEntry, QueueEntryExited } from '../../models/QueueEntry'
import useAppSettings from './context/useAppSettings'
import { formatDateTime } from './utils/dateFormat'
import useLanguage from './context/useLanguage'

export type HistoryDisplayProps = {
  data: QueueEntry[]
}

export default function HistoryDisplay({ data }: Readonly<HistoryDisplayProps>) {
  const t = useLanguage()

  const historyQueue = data
    .filter(e => isExited(e))
    .sort((a, b) => b.exited - a.exited)
    .slice(0, 5)

  const opacity = (i: number) => 1 - i / (historyQueue.length - 0.5)

  return (
    <div className='historyDisplay'>
      <h2 style={{ color: 'white' }}>{t.history.title}</h2>
      {historyQueue.map((item, i) => (
        <div className='historyEntry' key={item.username + item.exited} style={{ opacity: opacity(i) }}>
          <HistoryEntry item={item} />
        </div>
      ))}
    </div>
  )
}

function HistoryEntry({ item }: Readonly<{ item: QueueEntryExited }>) {
  const { language } = useAppSettings()

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div className='username'>{item.username}</div>
      <div className='timestamp'>{formatDateTime(item.exited, language.value)}</div>
    </div>
  )
}
