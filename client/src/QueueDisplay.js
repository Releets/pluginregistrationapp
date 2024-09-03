import './QueueDisplay.css'
import { formatDate } from './utils'

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
            <div className={i == 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueueFunction(i)}>
              {item.username}
            </div>
            <div className='entryTimeContainer'>Starttid:</div>
            <div className='entryTimeContainer'>{formatDate(item.entrytime)}</div>
            <div className='entryTimeContainer'>Estimert ferdig:</div>
            <div className='entryTimeContainer'>{formatDate(item.estimatedFinishTime).split('|')[0]}</div>
          </div>
        ))}
    </div>
  )
}
