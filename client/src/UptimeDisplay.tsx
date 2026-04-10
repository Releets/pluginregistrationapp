import './styles/UptimeDisplay.css'
import { UptimeSummary } from './api/queueApi'

type Props = {
  uptime: UptimeSummary
}

export default function UptimeDisplay({ uptime }: Readonly<Props>) {
  return (
    <div className='uptimeDock'>
      <div className='uptimeHeader'>
        <span className='uptimePercentage'>{uptime.uptimePercentage.toFixed(1)}% uptime</span>
      </div>
      <div className='uptimeTimeline'>
        {uptime.days.map(day => (
          <div key={day.date} className='uptimeDotWrap'>
            <div className={`uptimeDot uptimeDot-${day.status}`} />
            <div className='uptimeTooltip'>
              <div>{day.date}</div>
              <div>{((day.actual / Math.max(day.expected, 1)) * 100).toFixed(1)}% uptime</div>
            </div>
          </div>
        ))}
      </div>
      <div className='uptimeFooter'>
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
