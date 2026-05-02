import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AdminPage
 *
 * Page-level guard: only SUPERADMIN can reach this page.
 *
 * Per the rights matrix (Section 3.2 of the Project Development Guide),
 * ADM_USER is SUPERADMIN-only. ADMIN (HR Manager) does NOT hold ADM_USER = 1.
 * Any non-SUPERADMIN is redirected to /employees (the app's default landing page).
 *
 * The sidebar link is already gated in navItems.js (allowedRoles: ['SUPERADMIN']),
 * but this page-level guard provides a defence-in-depth safety net against
 * direct URL navigation.
 *
 * Content to be filled in Sprint 3 (UserManagementPage per the sprint plan).
 */
export default function AdminPage() {
  const { userRole } = useAuth()

  // Redirect non-SUPERADMIN users to /employees, not "/",
  // since "/" has no defined route in this app's router config.
  if (userRole !== 'SUPERADMIN') return <Navigate to="/employees" replace />

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          User management and system configuration.
        </p>
      </div>

      {/* Role indicator — useful during development */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 font-medium mb-6">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0ZM7 5.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v2.5h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75Z" />
        </svg>
        Signed in as {userRole}
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center">
        <p className="text-sm text-gray-400">Admin panel content — coming in Sprint 3.</p>
      </div>
    </div>
  )
}