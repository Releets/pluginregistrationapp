import './QueueDisplay.css'
import PropTypes from 'prop-types'

QueueDisplay.propTypes = {
  leaveQueueFunction: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
}

function getEstimated(entry) {
  return (entry.estimatedFinishTime - entry.entrytime) / 60 / 60 / 1000
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
            {i === 0 ? (
              <>
                <div className='entryTimeContainer'>Booket til</div>
                <div className='entryTimeContainer'>
                  {new Date(item.estimatedFinishTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            ) : (
              <>
                <div className='entryTimeContainer'>Estimert</div>
                <div className='entryTimeContainer'>
                  {getEstimated(item)} time{getEstimated(item) === 1 ? '' : 'r'}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}
