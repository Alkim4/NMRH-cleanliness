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
      {/* -------------------- 3-day cycle averages -------------------- */}
      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">3-day cycle averages</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink/60">No grading rounds recorded yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden ledger-card divide-y divide-paper-line">
              {history.map((c) => (
                <div key={c.cycleIndex} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Cycle #{c.cycleIndex}{!c.complete && ' (in progress)'}
                    </span>
                    {c.complete ? (
                      <Stamp pass={!c.fail} size="sm" />
                    ) : (
                      <span className="pill-muted">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50">{c.sessionDates.join(', ')}</p>
                  <p className="text-sm mt-1">
                    Average: <span className="font-medium">{c.average} / 100</span>
                  </p>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden sm:block ledger-card overflow-x-auto">
              <table className="ledger text-sm min-w-[480px]">
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
          </>
        )}
      </section>

      {/* -------------------- Monthly points -------------------- */}
      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">Monthly points</h2>
        <p className="text-xs text-ink/50 -mt-2 mb-3">
          Only counts finished 3-day cycles. A cycle still in progress won't add points yet.
        </p>
        {monthly.length === 0 ? (
          <p className="text-sm text-ink/60">No completed cycles yet this term.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden ledger-card divide-y divide-paper-line">
              {monthly.map((m) => (
                <div key={m.monthKey} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.monthLabel}</p>
                    <p className="text-xs text-ink/50">{m.violations} violation(s)</p>
                  </div>
                  <span className="text-brick font-medium">
                    {m.points ? `+${m.points}` : '0'}
                  </span>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden sm:block ledger-card overflow-x-auto">
              <table className="ledger text-sm min-w-[380px]">
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
          </>
        )}
      </section>

      {/* -------------------- Grading round history -------------------- */}
      <section>
        <h2 className="font-display text-xl text-moss-dark mb-3">Grading round history</h2>
        <p className="text-xs text-ink/50 -mt-2 mb-3">
          Full breakdown by criteria, so it's easy to see what needs work.
        </p>
        {roomSessions.length === 0 ? (
          <p className="text-sm text-ink/60">No individual scores recorded yet.</p>
        ) : (
          <>
            {/* Mobile: stacked cards, one criterion per line */}
            <div className="sm:hidden ledger-card divide-y divide-paper-line">
              {roomSessions.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.session_date}</span>
                    <span className="text-sm font-medium">{entryTotal(s.entry)} / 100</span>
                  </div>
                  <p className="text-xs text-ink/50 mb-2">Checked by {s.checker_name}</p>
                  <div className="space-y-1">
                    {CRITERIA.map((c) => (
                      <div key={c.key} className="flex items-center justify-between text-sm">
                        <span className="text-ink/60">
                          {c.label} <span className="text-ink/35">(max {c.max})</span>
                        </span>
                        <span className="font-medium tabular-nums">{s.entry[c.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden sm:block ledger-card overflow-x-auto">
              <table className="ledger text-sm min-w-[720px]">
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
          </>
        )}
      </section>
    </div>
  )
}