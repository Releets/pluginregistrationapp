import './styles/HistoryDisplay.css'
import PropTypes from 'prop-types'
import './HistoryDisplay.css'
import { formatDate } from './utils'

HistoryDisplay.propTypes = {
  queue: PropTypes.array.isRequired,
}

export default function HistoryDisplay({ queue }) {
  const queueLength = Math.min(5, queue.length)
  const opacity = i => 1 - i / (queueLength - 0.5)

  return (
    <div className='historyDisplay'>
      <h2 style={{ color: 'white' }}>Logg</h2>
      {queue
        .sort((a, b) => b.queueExitTime - a.queueExitTime)
        .slice(0, 5)
        .map((item, i) => (
          <div className='historyEntry' key={item.username + item.queueExitTime} style={{ opacity: opacity(i) }}>
            <HistoryEntry key={item.username} item={item} index={i} />
          </div>
        ))}
    </div>
  )
}

HistoryEntry.propTypes = {
  item: PropTypes.object.isRequired,
}

function HistoryEntry({ item }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
      <div className='username'>{item.username}</div>
      <div className='timestamp'>{formatDate(item.queueExitTime)}</div>
    </div>
  )
}
