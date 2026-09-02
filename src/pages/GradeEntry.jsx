import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Masthead from '../components/Masthead'
import { supabase } from '../lib/supabaseClient'
import { useLedgerData } from '../lib/useLedgerData'
import { useAuth } from '../context/AuthContext'
import { CRITERIA, entryTotal } from '../lib/gradingLogic'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function GradeEntry() {
  const { rooms, loading } = useLedgerData()
  const { session } = useAuth()
  const navigate = useNavigate()

  const [sessionDate, setSessionDate] = useState(todayISO())
  const [checkerName, setCheckerName] = useState('')
  const [scores, setScores] = useState({}) // { [roomId]: { cleanliness, orderliness, ... } }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function setScore(roomId, key, value) {
    setScores((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], [key]: value === '' ? '' : Number(value) },
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!checkerName.trim()) {
      setError('Enter the checker\u2019s name.')
      return
    }
    setSaving(true)

    const { data: newSession, error: sessionErr } = await supabase
      .from('grading_sessions')
      .insert({ session_date: sessionDate, checker_name: checkerName, created_by: session?.user?.id })
      .select()
      .single()

    if (sessionErr) {
      setError(sessionErr.message)
      setSaving(false)
      return
    }

    const entries = rooms
      .map((room) => {
        const s = scores[room.id] || {}
        const hasAnyScore = CRITERIA.some((c) => s[c.key] !== undefined && s[c.key] !== '')
        if (!hasAnyScore) return null
        return {
          session_id: newSession.id,
          room_id: room.id,
          cleanliness: s.cleanliness || 0,
          orderliness: s.orderliness || 0,
          conduciveness: s.conduciveness || 0,
          overall_appearance: s.overall_appearance || 0,
        }
      })
      .filter(Boolean)

    if (entries.length === 0) {
      setError('Enter at least one room\u2019s scores before saving.')
      setSaving(false)
      await supabase.from('grading_sessions').delete().eq('id', newSession.id)
      return
    }

    const { error: entriesErr } = await supabase.from('grading_entries').insert(entries)
    setSaving(false)

    if (entriesErr) {
      setError(entriesErr.message)
      return
    }

    navigate('/admin')
  }

  return (
    <div className="min-h-screen pb-16">
      <Masthead subtitle="Admin — New Grading Round" />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-display text-2xl text-moss-dark mb-6">Enter a grading round</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">Date</label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="border border-paper-line bg-white rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">Checker</label>
              <input
                type="text"
                required
                value={checkerName}
                onChange={(e) => setCheckerName(e.target.value)}
                placeholder="Name of the person grading"
                className="border border-paper-line bg-white rounded px-3 py-2 text-sm w-56"
              />
            </div>
          </div>

          {error && <p className="text-brick text-sm mb-4">{error}</p>}

          {loading ? (
            <p className="text-sm text-ink/60">Loading rooms…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="ledger text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-2 pr-3">Room</th>
                    {CRITERIA.map((c) => (
                      <th key={c.key} className="py-2 pr-3">
                        {c.label}
                        <div className="normal-case text-ink/40">max {c.max}</div>
                      </th>
                    ))}
                    <th className="py-2 pr-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => {
                    const s = scores[room.id] || {}
                    const total = entryTotal(s)
                    return (
                      <tr key={room.id}>
                        <td className="py-2 pr-3 font-display text-lg text-moss-dark">
                          {room.room_number}
                        </td>
                        {CRITERIA.map((c) => (
                          <td key={c.key} className="py-2 pr-3">
                            <input
                              type="number"
                              min={0}
                              max={c.max}
                              value={s[c.key] ?? ''}
                              onChange={(e) => setScore(room.id, c.key, e.target.value)}
                              className="w-16 border border-paper-line bg-white rounded px-2 py-1 text-sm"
                            />
                          </td>
                        ))}
                        <td className="py-2 pr-3 font-medium">{total || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || loading}
            className="mt-6 bg-moss hover:bg-moss-dark transition-colors text-white rounded px-5 py-2 text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save grading round'}
          </button>
        </form>
      </main>
    </div>
  )
}
