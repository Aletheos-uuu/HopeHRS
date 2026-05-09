import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'
import UserTable from '../components/ui/UserTable'
import ConfirmDialog from '../components/ui/ConfirmDialog'

/**
 * UserManagementPage.jsx
 *
 * Route: /admin
 *
 * Page-level guard: only SUPERADMIN (ADM_USER = 1) may access this page.
 * ADMIN has ADM_USER = 0 and is redirected to /employees.
 * The sidebar already hides the Admin link from non-SUPERADMIN roles;
 * this guard is a second layer of defence for direct URL access.
 *
 * Responsibilities:
 *   1. Fetch the full user list via getUsers()
 *   2. Show a confirmation dialog before any activate/deactivate action
 *   3. Call the appropriate service function, refresh the list, show feedback
 *   4. Never allow action on a SUPERADMIN row (guarded in service + UI)
 */
export default function UserManagementPage() {
  const { currentUser } = useAuth()

  // Route guard — only SUPERADMIN
  if (!currentUser || currentUser.user_type !== 'SUPERADMIN') {
    return <Navigate to="/employees" replace />
  }

  return <UserManagementContent currentUser={currentUser} />
}

/**
 * Separated from the guard above so hooks run unconditionally.
 * (Early return before hooks would violate the Rules of Hooks.)
 */
function UserManagementContent({ currentUser }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    confirmStyle: 'primary',
    targetUser: null,
    action: null, // 'activate' | 'deactivate'
  })
  const [isActing, setIsActing] = useState(null) // userId currently being processed

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Auto-clear success message after 4 seconds
  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(null), 4000)
    return () => clearTimeout(t)
  }, [successMsg])

  function openActivateDialog(user) {
    setDialog({
      isOpen: true,
      title: 'Activate account',
      message: `Activate ${user.username ?? user.email}? They will be able to log in immediately.`,
      confirmLabel: 'Activate',
      confirmStyle: 'success',
      targetUser: user,
      action: 'activate',
    })
  }

  function openDeactivateDialog(user) {
    setDialog({
      isOpen: true,
      title: 'Deactivate account',
      message: `Deactivate ${user.username ?? user.email}? They will be signed out and unable to log in until reactivated.`,
      confirmLabel: 'Deactivate',
      confirmStyle: 'danger',
      targetUser: user,
      action: 'deactivate',
    })
  }

  function closeDialog() {
    setDialog((d) => ({ ...d, isOpen: false, targetUser: null }))
  }

  async function handleConfirm() {
    const { targetUser, action } = dialog
    if (!targetUser) return

    setIsActing(targetUser.userId)
    closeDialog()

    try {
      if (action === 'activate') {
        await activateUser(targetUser.userId, currentUser.userId, targetUser.user_type)
        setSuccessMsg(`${targetUser.username ?? targetUser.email} has been activated.`)
      } else {
        await deactivateUser(targetUser.userId, currentUser.userId, targetUser.user_type)
        setSuccessMsg(`${targetUser.username ?? targetUser.email} has been deactivated.`)
      }
      await fetchUsers()
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsActing(null)
    }
  }

  // Stat counts for the summary cards
  const totalUsers = users.filter((u) => u.user_type !== 'SUPERADMIN').length
  const activeCount = users.filter((u) => u.user_type !== 'SUPERADMIN' && u.record_status === 'ACTIVE').length
  const pendingCount = users.filter((u) => u.user_type !== 'SUPERADMIN' && u.record_status === 'INACTIVE').length

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Activate or deactivate HR staff accounts. SUPERADMIN accounts are protected.
        </p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-emerald-800">{successMsg}</p>
        </div>
      )}

      {/* Summary cards */}
      {!isLoading && (
        <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total accounts', value: totalUsers, color: 'text-gray-900' },
            { label: 'Active', value: activeCount, color: 'text-emerald-700' },
            { label: 'Pending activation', value: pendingCount, color: 'text-amber-700' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* User table */}
      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <svg className="mb-3 h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">No users found</p>
          <p className="mt-1 text-xs text-gray-400">User accounts will appear here once registered.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <UserTable
          users={users}
          onActivate={openActivateDialog}
          onDeactivate={openDeactivateDialog}
          isActing={isActing}
        />
      )}

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        confirmStyle={dialog.confirmStyle}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  )
}