import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const isLoggedIn = false // M4 will replace this with real auth

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}