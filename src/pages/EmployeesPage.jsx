import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePermission } from '../context/AuthContext'
import AddEmployeeModal from '../components/employees/AddEmployeeModal'
import EditEmployeeModal from '../components/employees/EditEmployeeModal'
import SoftDeleteConfirmDialog from '../components/employees/SoftDeleteConfirmDialog'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {status}
    </span>
  )
}

function StampBadge({ date }) {
  if (!date) return <span className="text-gray-300 text-xs">—</span>
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800">
      {date}
    </span>
  )
}

function IconButton({ onClick, title, children, variant = 'default' }) {
  const base =
    'inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400'
  const variants = {
    default: 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
    danger: 'text-gray-400 hover:text-red-600 hover:bg-red-50',
  }
  return (
    <button onClick={onClick} title={title} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474L5.81 13.75a.75.75 0 0 1-.374.206l-3.5.875a.75.75 0 0 1-.911-.912l.875-3.5a.75.75 0 0 1 .206-.373L11.013 1.427ZM12.72 2.488a.25.25 0 0 0-.353 0L3.496 11.359l-.57 2.283 2.283-.571 8.87-8.871a.25.25 0 0 0 0-.353L12.72 2.488Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const { userRole, employees, loading } = useAuth()

  // permission gates
  const isAdmin = usePermission('IS_ADMIN')
  const canAdd   = usePermission('EMP_ADD')
  const canEdit  = usePermission('EMP_EDIT')
  const canDel   = usePermission('EMP_DEL')

  // visibility: USERs see only ACTIVE; ADMIN/SUPERADMIN see all
  const visible = userRole === 'USER'
    ? (employees ?? []).filter((e) => e.status === 'ACTIVE')
    : (employees ?? [])

  // local UI state
  const [search, setSearch]               = useState('')
  const [showInactive, setShowInactive]   = useState(false)
  const [addOpen, setAddOpen]             = useState(false)
  const [editTarget, setEditTarget]       = useState(null)   // employee object
  const [deleteTarget, setDeleteTarget]   = useState(null)   // employee object

  const canSeeInactive = userRole !== 'USER'

  const filtered = useMemo(() => {
    return visible.filter((emp) => {
      if (canSeeInactive && !showInactive && emp.status === 'INACTIVE') return false
      if (search) {
        const q = search.toLowerCase()
        return (
          emp.empno?.toLowerCase().includes(q) ||
          emp.lastname?.toLowerCase().includes(q) ||
          emp.firstname?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [visible, search, showInactive, canSeeInactive])

  const totalActive   = (employees ?? []).filter((e) => e.status === 'ACTIVE').length
  const totalInactive = (employees ?? []).filter((e) => e.status === 'INACTIVE').length

  // action handlers (wired up; actual Supabase calls live inside modals)
  function handleAddSuccess(newEmployee) {
    setAddOpen(false)
    // TODO: refetch or optimistically push `newEmployee` into local state
  }

  function handleEditSuccess(updatedEmployee) {
    setEditTarget(null)
    // TODO: refetch or patch local state
  }

  function handleDeleteSuccess(empno) {
    setDeleteTarget(null)
    // TODO: refetch or remove from local state
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading employees…
      </div>
    )
  }

  // how many cols the "no results" cell should span
  const colSpan = 7 + (isAdmin ? 1 : 0) + (canEdit || canDel ? 1 : 0)

  return (
    <div className="p-6 space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-medium text-gray-900">Employees</h1>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or emp no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />

          {canSeeInactive && (
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="accent-violet-600"
              />
              Show inactive
            </label>
          )}

          {canAdd && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <PlusIcon />
              Add employee
            </button>
          )}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: (employees ?? []).length },
          { label: 'Active',   value: totalActive },
          { label: 'Inactive', value: totalInactive },
          { label: 'Showing',  value: filtered.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="border border-gray-100 rounded-xl overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Emp No</th>
              <th className="px-4 py-3 text-left font-medium">Last name</th>
              <th className="px-4 py-3 text-left font-medium">First name</th>
              <th className="px-4 py-3 text-left font-medium">Gender</th>
              <th className="px-4 py-3 text-left font-medium">Hire date</th>
              <th className="px-4 py-3 text-left font-medium">Sep date</th>
              <th className="px-4 py-3 text-left font-medium">Current job</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              {isAdmin && (
                <th className="px-4 py-3 text-left font-medium">Stamp</th>
              )}
              {(canEdit || canDel) && (
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-10 text-center text-gray-300 text-sm"
                >
                  No employees found
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.empno}
                  className={
                    emp.status === 'INACTIVE'
                      ? 'opacity-50'
                      : 'hover:bg-gray-50 transition-colors'
                  }
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{emp.empno}</td>
                  <td className="px-4 py-3 text-gray-900">{emp.lastname}</td>
                  <td className="px-4 py-3 text-gray-900">{emp.firstname}</td>
                  <td className="px-4 py-3 text-gray-500">{emp.gender}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(emp.hiredate)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(emp.sepDate)}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.currentJob}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <StampBadge date={emp.stamp} />
                    </td>
                  )}
                  {(canEdit || canDel) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <IconButton
                            title="Edit employee"
                            onClick={() => setEditTarget(emp)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {canDel && (
                          <IconButton
                            title="Delete employee"
                            variant="danger"
                            onClick={() => setDeleteTarget(emp)}
                          >
                            <TrashIcon />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-300">
        {filtered.length} of {(employees ?? []).length} records shown
      </p>

      {/* ── Modals & dialogs ─────────────────────────────────────────────── */}
      {canAdd && (
        <AddEmployeeModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {canEdit && editTarget && (
        <EditEmployeeModal
          open={!!editTarget}
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {canDel && deleteTarget && (
        <SoftDeleteConfirmDialog
          open={!!deleteTarget}
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}