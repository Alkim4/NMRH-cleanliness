import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

/**
 * Loads all rooms and all grading sessions (with their per-room entries
 * attached) so the UI can compute cycle averages and monthly points
 * client-side. Fine for a dorm-scale dataset.
 */
export function useLedgerData() {
  const [rooms, setRooms] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    const [{ data: roomRows, error: roomErr }, { data: sessionRows, error: sessionErr }] =
      await Promise.all([
        supabase.from('rooms').select('id, room_number').order('room_number'),
        supabase
          .from('grading_sessions')
          .select('id, session_date, checker_name, grading_entries ( room_id, cleanliness, orderliness, conduciveness, overall_appearance )')
          .order('session_date', { ascending: true }),
      ])

    if (roomErr || sessionErr) {
      setError((roomErr || sessionErr).message)
      setLoading(false)
      return
    }

    setRooms(roomRows || [])
    setSessions(
      (sessionRows || []).map((s) => ({
        id: s.id,
        session_date: s.session_date,
        checker_name: s.checker_name,
        entries: s.grading_entries || [],
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rooms, sessions, loading, error, refresh }
}
