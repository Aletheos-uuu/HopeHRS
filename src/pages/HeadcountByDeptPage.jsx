import { useState, useEffect } from 'react'
import { getHeadcountByDept } from '../services/reportService'
import ReportTable from '../components/reports/ReportTable'

/**
 * HeadcountByDeptPage.jsx
 *
 * Route: /reports/headcount
 *
 * Shows active employee headcount per department from the
 * headcount_by_dept view (created by M3).
 * Displays both a visual bar chart and a data table.
 */
export default function HeadcountByDeptPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        setIsLoading(true)
        setError(null)
        const rows = await getHeadcountByDept()
        setData(rows)
      } catch {
        setError('Failed to load headcount data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  const maxCount = Math.max(...data.map((r) => r.active_employee_count ?? 0), 1)
  const totalActive = data.reduce((sum, r) => sum + (r.active_employee_count ?? 0), 0)

  const columns = [
    { key: 'deptCode', label: 'Code' },
    { key: 'deptName', label: 'Department' },
    {
      key: 'active_employee_count',
      label: 'Active employees',
      align: 'right',
      render: (val) => (
        <span className="font-medium text-gray-900">{val ?? 0}</span>
      ),
    },
    {
      key: '_bar',
      label: '',
      render: (_, row) => {
        const pct = ((row.active_employee_count ?? 0) / maxCount) * 100
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="h-2 flex-1 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-gray-400">
              {Math.round(pct)}%
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Headcount by Department</h1>
        <p className="mt-1 text-sm text-gray-500">
          Active employee count per department based on current job assignments.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Summary card */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total active employees</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalActive}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Departments</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{data.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">Largest department</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 truncate">
              {data[0]?.deptName ?? '—'}
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <ReportTable
          columns={columns}
          data={data}
          emptyMsg="No department data available."
        />
      )}
    </div>
  )
}