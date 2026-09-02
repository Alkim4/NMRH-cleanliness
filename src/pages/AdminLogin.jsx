import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />


  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-4xl text-moss-dark">NMRH</p>
          <p className="text-sm text-ink/60 mt-1">Admin sign in</p>
        </div>

        {error && (
          <p className="text-sm bg-brick-light text-brick border border-brick/40 rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-paper-line bg-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              placeholder="admin@nmrh.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-paper-line bg-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-moss hover:bg-moss-dark transition-colors text-white rounded py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? 'Please wait…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-ink/50 text-center mt-6">
          Admin accounts are created directly in Supabase, there's no public sign-up here.
        </p>
        <p className="text-xs text-center mt-3">
          <Link to="/" className="text-moss-dark underline underline-offset-2">
            ← Back to the room ledger
          </Link>
        </p>
      </div>
    </div>
  )
}
