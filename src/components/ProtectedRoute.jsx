import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'          // add this
import { useUserRights } from '../context/UserRightsContext'
import AppShell from './AppShell'

export default function ProtectedRoute() {
  const { currentUser, loading: authLoading } = useAuth()       // currentUser lives here
  const { loading: rightsLoading } = useUserRights()
  const location = useLocation()

  console.log('ProtectedRoute render:', { authLoading, rightsLoading, currentUser: !!currentUser });
  if (authLoading || rightsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />

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