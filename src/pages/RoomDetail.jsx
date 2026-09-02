import { useParams, Link } from 'react-router-dom'
import Masthead from '../components/Masthead'
import RoomHistory from '../components/RoomHistory'
import { useLedgerData } from '../lib/useLedgerData'

export default function RoomDetail() {
  const { roomId } = useParams()
  const { rooms, sessions, loading } = useLedgerData()
  const room = rooms.find((r) => String(r.id) === roomId)

  return (
    <div className="min-h-screen pb-16">
      <Masthead subtitle="Room Detail" />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/" className="text-sm text-moss-dark hover:underline">
          ← Back to all rooms
        </Link>
        {loading ? (
          <p className="text-sm text-ink/60 mt-4">Loading…</p>
        ) : !room ? (
          <p className="text-sm text-ink/60 mt-4">Room not found.</p>
        ) : (
          <>
            <h1 className="font-display text-3xl text-moss-dark mt-4 mb-8">
              Room {room.room_number}
            </h1>
            <RoomHistory room={room} sessions={sessions} />
          </>
        )}
      </main>
    </div>
  )
}
