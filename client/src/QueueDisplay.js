import './QueueDisplay.css'

export default function QueueDisplay(props) {
  function leaveQueue(index) {
    props.leaveQueueFunction(index)
  }

  return (
    <div className='queue'>
      {props.items.map((item, i) =>
        i < 5 ? (
          <div key={item} className={i === 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueue(i)}>
            {item}
          </div>
        ) : null
      )}
    </div>
  )
}
