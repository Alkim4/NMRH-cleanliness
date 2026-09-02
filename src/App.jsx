import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PublicLedger from './pages/PublicLedger'
import RoomDetail from './pages/RoomDetail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import GradeEntry from './pages/GradeEntry'

function AdminGate({ children }) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-sm text-ink/60">Loading…</p>
  }
  if (!session || !isAdmin) return <Navigate to="/admin-login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public — anyone with the link sees this, no login needed */}
        <Route path="/" element={<PublicLedger />} />
        <Route path="/room/:roomId" element={<RoomDetail />} />

        {/* Admin — separate login, only admins get past this point */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGate>
              <AdminDashboard />
            </AdminGate>
          }
        />
        <Route
          path="/admin/grade"
          element={
            <AdminGate>
              <GradeEntry />
            </AdminGate>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
