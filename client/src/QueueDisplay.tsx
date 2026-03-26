import './styles/QueueDisplay.css'
import type { QueueEntry } from '../../models/QueueEntry'
import { formatTime } from './utils/dateFormat'

export type QueueDisplayProps = {
  items: QueueEntry[]
  leaveQueueFunction: (id: string) => void
}

function formattedFinishTime(entry: QueueEntry): string {
  const entered = entry.entered ?? 0
  const finishUtcMs = entered + entry.estimated * 60 * 60 * 1000
  return formatTime(finishUtcMs)
}

export default function QueueDisplay({ leaveQueueFunction, items }: QueueDisplayProps) {
  return (
    <div className='queue'>
      {[...items]
        .sort((a, b) => (b.entered ?? 0) - (a.entered ?? 0))
        .map((item, i) => (
          <div key={item.id}>
            <div className={i === 0 ? 'userBox firstBox' : 'userBox'} onClick={() => leaveQueueFunction(item.id)}>
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
