import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Masthead({ subtitle }) {
  const auth = useAuth()

  return (
    <header className="relative overflow-hidden h-40 sm:h-48">
      <img
        src="/nmrh-hero.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-moss-dark/85 via-moss-dark/55 to-moss-dark/20" />

      <div className="relative h-full max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white rounded-full w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center shadow-sm p-2 overflow-hidden">
            <img src="/nmrh-logo.jpg" alt="NMRH" className="w-full h-full object-contain" />
          </div>
          <p className="font-display italic text-paper text-sm sm:text-base tracking-wide drop-shadow-sm">
            {subtitle || 'Room Cleanliness Ledger'}
          </p>
        </Link>

        {auth?.isAdmin ? (
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-white drop-shadow-sm">
              {auth.profile?.full_name}
            </p>
            <button
              onClick={auth.signOut}
              className="text-xs underline decoration-meadow underline-offset-2 text-meadow-light hover:text-white mt-0.5"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/admin-login"
            className="text-xs text-white/70 hover:text-white underline underline-offset-2"
          >
            Admin
          </Link>
        )}
      </div>
    </header>
  )
}