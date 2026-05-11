import { useState, useEffect } from 'react'
import { getSalarySummaryByJob } from '../services/reportService'
import ReportTable from '../components/reports/ReportTable'

/**
 * SalaryReportPage.jsx
 *
 * Route: /reports/salary
 *
 * Shows min / max / avg salary per active job code from the
 * salary_summary_by_job view (created by M3).
 */

function formatSalary(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default function SalaryReportPage() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        setIsLoading(true)
        setError(null)
        const rows = await getSalarySummaryByJob()
        setData(rows)
      } catch {
        setError('Failed to load salary data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  const overallAvg = data.length
    ? data.reduce((sum, r) => sum + Number(r.avg_salary ?? 0), 0) / data.length
    : 0

  const highestJob = data[0] ?? null

  const columns = [
    { key: 'jobcode', label: 'Code' },
    { key: 'jobdesc', label: 'Job title' },
    {
      key: 'employee_count',
      label: 'Assignments',
      align: 'right',
      render: (val) => <span className="text-gray-500">{val ?? 0}</span>,
    },
    {
      key: 'min_salary',
      label: 'Min salary',
      align: 'right',
      render: (val) => formatSalary(val),
    },
    {
      key: 'max_salary',
      label: 'Max salary',
      align: 'right',
      render: (val) => formatSalary(val),
    },
    {
      key: 'avg_salary',
      label: 'Avg salary',
      align: 'right',
      render: (val) => (
        <span className="font-medium text-indigo-700">{formatSalary(val)}</span>
      ),
    },
  ]

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Salary Summary by Job</h1>
        <p className="mt-1 text-sm text-gray-500">
          Min, max, and average salary per active job code from current job history records.
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

      {/* Summary cards */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Job codes tracked</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{data.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Overall avg salary</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-700">
              {formatSalary(overallAvg)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500">Highest paid role</p>
            <p className="mt-1 text-lg font-semibold text-gray-900 truncate">
              {highestJob ? `${highestJob.jobdesc} (${highestJob.jobcode})` : '—'}
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
          emptyMsg="No salary data available."
        />
      )}
    </div>
  )
}