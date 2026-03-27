import { UptimeSummary } from './api/queueApi'

type Props = {
  uptime: UptimeSummary
}

export default function UptimeDisplay({ uptime }: Readonly<Props>) {
  return (
    <div className='uptimeCard'>
      <div className='uptimeHeader'>
        <span className='uptimeTitle'>Cursor App</span>
        <span className='uptimePercentage'>{uptime.uptimePercentage.toFixed(1)}% uptime</span>
      </div>
      <div className='uptimeTimeline'>
        {uptime.days.map(day => (
          <div
            key={day.date}
            className={`uptimeBlock uptimeBlock-${day.status}`}
            title={`${day.date}: ${day.actual}/${day.expected} checks`}
          />
        ))}
      </div>
      <div className='uptimeFooter'>
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
