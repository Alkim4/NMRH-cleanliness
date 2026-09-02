import { Link } from 'react-router-dom'
import Masthead from '../components/Masthead'
import RoomGrid from '../components/RoomGrid'
import { useLedgerData } from '../lib/useLedgerData'

export default function AdminDashboard() {
  const { rooms, sessions, loading, error } = useLedgerData()

  return (
    <div className="min-h-screen pb-16">
      <Masthead subtitle="Admin — Room Overview" />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-2xl text-moss-dark mb-1">This month's rooms</h1>
            <p className="text-sm text-ink/50">Tap a room to see its full grading history.</p>
          </div>
          <Link
            to="/admin/grade"
            className="bg-moss text-white rounded px-4 py-2 text-sm font-medium hover:bg-moss-dark transition-colors"
          >
            Enter a grading round
          </Link>
        </div>

        {error && <p className="text-brick text-sm mb-4">{error}</p>}
        {loading ? (
          <p className="text-ink/60 text-sm">Loading ledger…</p>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-ink/60">
            No rooms yet. Add rooms in Supabase (table <code>rooms</code>) to get started.
          </p>
        ) : (
          <RoomGrid rooms={rooms} sessions={sessions} />
        )}
      </main>
    </div>
  )
}