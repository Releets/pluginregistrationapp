import './styles/QueueDisplay.css'
import type { AppLocale } from '../../models/UserSettings'
import type { QueueEntry } from '../../models/QueueEntry'
import { useLanguage } from './context/useLanguage'
import { formatTime } from './utils/dateFormat'
import { formatHourEstimate } from './utils/hourEstimate'
import { intlLocaleTag } from './utils/intlLocale'

export type QueueDisplayProps = {
  items: QueueEntry[]
  leaveQueueFunction: (id: string) => void
}

function formattedFinishTime(entry: QueueEntry, locale: AppLocale): string {
  const entered = entry.entered ?? 0
  const finishUtcMs = entered + entry.estimated * 60 * 60 * 1000
  return formatTime(finishUtcMs, locale)
}

export default function QueueDisplay({ leaveQueueFunction, items }: QueueDisplayProps) {
  const { locale, t } = useLanguage()
  const intlTag = intlLocaleTag(locale)

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
                <div className='entryTimeContainer'>{t.queueDisplay.bookedUntil}</div>
                <div className='entryTimeContainer'>{formattedFinishTime(item, locale)}</div>
              </>
            ) : (
              <>
                <div className='entryTimeContainer'>{t.queueDisplay.estimated}</div>
                <div className='entryTimeContainer'>
                  {formatHourEstimate(item.estimated, intlTag, t)}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  )
}
