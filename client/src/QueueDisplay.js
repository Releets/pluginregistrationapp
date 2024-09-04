import './QueueDisplay.css'
import PropTypes from 'prop-types'

QueueDisplay.propTypes = {
  leaveQueueFunction: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
}

export default function QueueDisplay({ leaveQueueFunction, items }) {
  const formattedFinishTime = entry =>
    new Date(entry.entrytime + entry.estimated * 60 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className='queue'>
      {items
        .sort((a, b) => a.entrytime - b.entrytime)
        .map((item, i) => (
          <div key={item.username}>
            <div className={i === 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueueFunction(i)}>
              {item.username}
            </div>
            {i === 0 ? (
              <>
                <div className='entryTimeContainer'>Booket til</div>
                <div className='entryTimeContainer'>{formattedFinishTime(item)}</div>
              </>
            ) : (
              <>
                <div className='entryTimeContainer'>Estimert</div>
                <div className='entryTimeContainer'>
                  {item.estimated} time{item.estimated === 1 ? '' : 'r'}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}
