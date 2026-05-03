import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { UserRightsContext } from '../context/UserRightsContext'
import AppShell from './AppShell'

export default function ProtectedRoute() {
  const { currentUser, loading } = useContext(UserRightsContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Not logged in — redirect to login
  if (!currentUser) return <Navigate to="/login" replace />

  // USER accounts cannot access /deleted-items
  if (
    location.pathname.startsWith('/deleted-items') &&
    !['ADMIN', 'SUPERADMIN'].includes(currentUser.user_type)
  ) {
    return <Navigate to="/employees" replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}