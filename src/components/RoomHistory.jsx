import Stamp from './Stamp'
import {
  CRITERIA,
  buildRoomCycleHistory,
  entryTotal,
  monthlyPointsForRoom,
} from '../lib/gradingLogic'

export default function RoomHistory({ room, sessions }) {
  const history = buildRoomCycleHistory(sessions, room.id)
  const monthly = monthlyPointsForRoom(history)

  const roomSessions = sessions
    .map((s) => ({
      ...s,
      entry: s.entries.find((e) => e.room_id === room.id),
    }))
    .filter((s) => s.entry)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">3-day cycle averages</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink/60">No grading rounds recorded yet.</p>
        ) : (
          <div className="ledger-card">
            <table className="ledger text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th>Cycle</th>
                  <th>Dates</th>
                  <th className="num">Average</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((c) => (
                  <tr key={c.cycleIndex}>
                    <td>#{c.cycleIndex}{!c.complete && ' (in progress)'}</td>
                    <td className="text-ink/60">{c.sessionDates.join(', ')}</td>
                    <td className="num font-medium">{c.average} / 100</td>
                    <td>
                      {c.complete ? (
                        <Stamp pass={!c.fail} size="sm" />
                      ) : (
                        <span className="pill-muted">Pending — needs 3 days</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">Monthly points</h2>
        <p className="text-xs text-ink/50 -mt-2 mb-3">
          Only counts finished 3-day cycles. A cycle still in progress won't add points yet.
        </p>
        {monthly.length === 0 ? (
          <p className="text-sm text-ink/60">No completed cycles yet this term.</p>
        ) : (
          <div className="ledger-card">
            <table className="ledger text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th>Month</th>
                  <th className="num">Violations</th>
                  <th className="num">Points</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.monthKey}>
                    <td>{m.monthLabel}</td>
                    <td className="num">{m.violations}</td>
                    <td className="num text-brick font-medium">
                      {m.points ? `+${m.points}` : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">Grading round history</h2>
        <p className="text-xs text-ink/50 -mt-2 mb-3">
          Full breakdown by criteria, so it's easy to see what needs work.
        </p>
        {roomSessions.length === 0 ? (
          <p className="text-sm text-ink/60">No individual scores recorded yet.</p>
        ) : (
          <div className="ledger-card overflow-x-auto">
            <table className="ledger text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide">
                  <th>Date</th>
                  <th>Checker</th>
                  {CRITERIA.map((c) => (
                    <th key={c.key} className="num">
                      {c.label}
                      <div className="normal-case font-normal text-ink/40">max {c.max}</div>
                    </th>
                  ))}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {roomSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.session_date}</td>
                    <td className="text-ink/60">{s.checker_name}</td>
                    {CRITERIA.map((c) => (
                      <td key={c.key} className="num">
                        {s.entry[c.key]}
                      </td>
                    ))}
                    <td className="num font-medium">{entryTotal(s.entry)} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}