import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

const STAMP_ROLES = ['ADMIN', 'SUPERADMIN']
const INACTIVE_VISIBLE_ROLES = ['ADMIN', 'SUPERADMIN']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-500'
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

export default function EmployeesPage() {
  const { userRole, employees, loading } = useAuth()
  // TODO: replace `employees` with a Supabase fetch from `vw_employees_current_job`

  const canSeeStamp = STAMP_ROLES.includes(userRole)
  const canSeeInactive = INACTIVE_VISIBLE_ROLES.includes(userRole)

  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const filtered = useMemo(() => {
    return (employees ?? []).filter((emp) => {
      if (!canSeeInactive && emp.status === 'INACTIVE') return false
      if (canSeeInactive && !showInactive && emp.status === 'INACTIVE') return false
      if (search) {
        const q = search.toLowerCase()
        const match =
          emp.empno?.toLowerCase().includes(q) ||
          emp.lastname?.toLowerCase().includes(q) ||
          emp.firstname?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [employees, search, showInactive, canSeeInactive])

  const totalActive = (employees ?? []).filter((e) => e.status === 'ACTIVE').length
  const totalInactive = (employees ?? []).filter((e) => e.status === 'INACTIVE').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading employees…
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
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
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: (employees ?? []).length },
          { label: 'Active', value: totalActive },
          { label: 'Inactive', value: totalInactive },
          { label: 'Showing', value: filtered.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-medium text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
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
              {canSeeStamp && (
                <th className="px-4 py-3 text-left font-medium">Stamp</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={canSeeStamp ? 9 : 8}
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
                  {canSeeStamp && (
                    <td className="px-4 py-3">
                      <StampBadge date={emp.stamp} />
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
    </div>
  )
}