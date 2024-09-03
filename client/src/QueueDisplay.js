import './QueueDisplay.css'
import PropTypes from 'prop-types'

QueueDisplay.propTypes = {
  leaveQueueFunction: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
}

export default function QueueDisplay({ leaveQueueFunction, items }) {
  return (
    <div className='queue'>
      {items
        .sort((a, b) => a.entrytime - b.entrytime)
        .slice(0, 5)
        .map((item, i) => (
          <div key={item.username}>
            <div className={i === 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueueFunction(i)}>
              {item.username}
            </div>
            <div className='entryTimeContainer'>Ferdig:</div>
            <div className='entryTimeContainer'>
              {new Date(item.estimatedFinishTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
    </div>
  )
}
