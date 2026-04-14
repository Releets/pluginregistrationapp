import './styles/UptimeDisplay.css'
import { UptimeSummary } from './api/queueApi'
import useLanguage from './context/useLanguage'

type Props = {
  uptime: UptimeSummary
}

export default function UptimeDisplay({ uptime }: Readonly<Props>) {
  const t = useLanguage()

  return (
    <div className='uptimeDock'>
      
      <div className='uptimeHeader'>
        <span className='uptimePercentage'>{t.uptimeDisplay.percentLine(uptime.uptimePercentage)}</span>
      </div>
      
      <div className='uptimeTimeline'>
        {uptime.days.map(day => (
          <div key={day.date} className='uptimeDotWrap'>
            <div className={`uptimeDot uptimeDot-${day.status}`} />
            <div className='uptimeTooltip'>
              <div>{day.date}</div>
              <div>{t.uptimeDisplay.percentLine((day.actual / Math.max(day.expected, 1)) * 100)}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className='uptimeFooter'>
        <span>{t.uptimeDisplay.footerStart}</span>
        <span>{t.uptimeDisplay.footerEnd}</span>
      </div>
    </div>
  )
}
