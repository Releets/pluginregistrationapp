import './QueueDisplay.css'

export default function QueueDisplay(props) {
  function leaveQueue(index) {
    props.leaveQueueFunction(index)
  }

  function formatDate(date = Date.now()) {
    date = new Date(date)
    return (
      date.getHours() +
      ':' +
      String(date.getMinutes()).padStart(2, '0') +
      ' | ' +
      date.getDate() +
      ' ' +
      date.toLocaleString('default', { month: 'short' })
    )
  }

  return (
    <div className='queue'>
      {props.items.map((item, i) =>
        i < 5 ? (
          <div key={item.username}>
            <div className={i == 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueue(i)}>
              {item.username}
            </div>
            <div className='entryTimeContainer'>{formatDate(item.entrytime)}</div>
          </div>
        ) : null
      )}
    </div>
  )
}
