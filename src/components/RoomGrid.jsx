import { Link } from 'react-router-dom'
import Stamp from './Stamp'
import { buildRoomCycleHistory, monthlyPointsForRoom } from '../lib/gradingLogic'

export default function RoomGrid({ rooms, sessions }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {rooms.map((room) => {
        const history = buildRoomCycleHistory(sessions, room.id)
        const latest = history[history.length - 1]
        const monthly = monthlyPointsForRoom(history)
        const currentMonth = monthly[monthly.length - 1]

        return (
          <Link
            key={room.id}
            to={`/room/${room.id}`}
            className="group relative bg-white border border-paper-line rounded-lg p-5 hover:border-moss hover:shadow-md transition-all"
          >
            {latest && (
              <div className="absolute top-3 right-3">
                <Stamp pass={!latest.fail} size="sm" />
              </div>
            )}

            <p className="text-[0.65rem] uppercase tracking-widest text-ink/40 mb-0.5">Room</p>
            <p className="font-display text-4xl text-moss-dark leading-none mb-4 group-hover:text-moss transition-colors">
              {room.room_number}
            </p>

            <div className="flex items-baseline justify-between border-t border-paper-line pt-3">
              <span className="text-xs text-ink/50">Latest cycle</span>
              <span className="font-medium tabular-nums">
                {latest ? `${latest.average} / 100` : '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-xs text-ink/50">Points this month</span>
              <span
                className={`font-medium tabular-nums ${
                  currentMonth?.points ? 'text-brick' : ''
                }`}
              >
                {currentMonth?.points ? `+${currentMonth.points}` : '0'}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}