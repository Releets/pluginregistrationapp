import './styles/QueueDisplay.css'
import type { QueueEntry } from '../../models/QueueEntry'

export type QueueDisplayProps = {
  items: QueueEntry[]
  leaveQueueFunction: (index: number) => void
}

function formattedFinishTime(entry: QueueEntry): string {
  const entered = entry.entered ?? 0
  return new Date(entered + entry.estimated * 60 * 60 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QueueDisplay({ leaveQueueFunction, items }: QueueDisplayProps) {
  return (
    <div className='queue'>
      {[...items]
        .sort((a, b) => (b.entered ?? 0) - (a.entered ?? 0))
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
