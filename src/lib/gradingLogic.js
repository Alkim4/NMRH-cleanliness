// Core scoring rules for the NMRH cleanliness ledger.
//
// - A "session" is one day's grading round (one date + one checker) that
//   scores every room at once.
// - Every 3 sessions form a "cycle". A room's cycle score is the average
//   of its totals across those 3 sessions.
// - A cycle average below 90 is a FAIL and counts as one violation for
//   that room.
// - At the end of each calendar month, every violation costs 5 points.
//   Points are tallied per room, per month.

export const CRITERIA = [
  { key: 'cleanliness', label: 'Cleanliness', max: 40 },
  { key: 'orderliness', label: 'Orderliness', max: 30 },
  { key: 'conduciveness', label: 'Conduciveness to Learning', max: 20 },
  { key: 'overall_appearance', label: 'Overall Appearance', max: 10 },
]

export const MAX_TOTAL = CRITERIA.reduce((sum, c) => sum + c.max, 0) // 100
export const PASS_THRESHOLD = 90
export const POINTS_PER_VIOLATION = 5
export const SESSIONS_PER_CYCLE = 3

export function entryTotal(entry) {
  return CRITERIA.reduce((sum, c) => sum + (Number(entry?.[c.key]) || 0), 0)
}

/**
 * Group an array of sessions (sorted oldest -> newest, each with its
 * entries already attached as session.entries = [{room_id, ...scores}])
 * into cycles of SESSIONS_PER_CYCLE.
 */
export function groupIntoCycles(sessions) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.session_date) - new Date(b.session_date)
  )
  const cycles = []
  for (let i = 0; i < sorted.length; i += SESSIONS_PER_CYCLE) {
    cycles.push(sorted.slice(i, i + SESSIONS_PER_CYCLE))
  }
  return cycles
}

/**
 * For one room, compute the average total across the sessions in a
 * (possibly incomplete) cycle. Returns null if the room has no entries
 * in that cycle.
 */
export function roomCycleAverage(cycleSessions, roomId) {
  const totals = []
  for (const session of cycleSessions) {
    const entry = session.entries.find((e) => e.room_id === roomId)
    if (entry) totals.push(entryTotal(entry))
  }
  if (totals.length === 0) return null
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length
  return Math.round(avg * 100) / 100
}

export function isFail(average) {
  return average !== null && average < PASS_THRESHOLD
}

/**
 * Build a full per-room cycle history: for each complete-or-partial
 * cycle, the average, pass/fail, and the date of the cycle's last
 * session (used to bucket it into a month).
 */
export function buildRoomCycleHistory(sessions, roomId) {
  const cycles = groupIntoCycles(sessions)
  return cycles
    .map((cycleSessions, index) => {
      const average = roomCycleAverage(cycleSessions, roomId)
      if (average === null) return null
      const lastDate = cycleSessions[cycleSessions.length - 1].session_date
      return {
        cycleIndex: index + 1,
        sessionDates: cycleSessions.map((s) => s.session_date),
        average,
        fail: isFail(average),
        complete: cycleSessions.length === SESSIONS_PER_CYCLE,
        lastDate,
      }
    })
    .filter(Boolean)
}

/**
 * Tally monthly violation points for a room from its cycle history.
 * Returns an array of { monthKey, monthLabel, violations, points }
 * sorted oldest -> newest.
 */
export function monthlyPointsForRoom(cycleHistory) {
  const byMonth = new Map()
  for (const cycle of cycleHistory) {
    if (!cycle.complete) continue // only finished 3-day cycles count toward violations
    const d = new Date(cycle.lastDate)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        monthKey,
        monthLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        violations: 0,
      })
    }
    if (cycle.fail) byMonth.get(monthKey).violations += 1
  }
  return [...byMonth.values()]
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((m) => ({ ...m, points: m.violations * POINTS_PER_VIOLATION }))
}
