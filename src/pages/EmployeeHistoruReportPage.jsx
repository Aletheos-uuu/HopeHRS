import { useState, useEffect } from 'react'
import { getActiveEmployees, getEmployeeFullHistory } from '../services/reportService'
import ReportTable from '../components/reports/ReportTable'

/**
 * EmployeeHistoryReportPage.jsx
 *
 * Route: /reports/employee-history
 *
 * Two-step page:
 *   1. EmployeeSelector — searchable dropdown of all ACTIVE employees
 *   2. On selection, fetches and displays the full chronological job
 *      history for that employee via getEmployeeFullHistory(empNo)
 */

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatSalary(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default function EmployeeHistoryReportPage() {
  const [employees, setEmployees] = useState([])
  const [empLoading, setEmpLoading] = useState(true)
  const [empError, setEmpError] = useState(null)

  const [selectedEmpNo, setSelectedEmpNo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const [histError, setHistError] = useState(null)

  // Load employee list on mount
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setEmpLoading(true)
        const rows = await getActiveEmployees()
        setEmployees(rows)
      } catch {
        setEmpError('Failed to load employee list.')
      } finally {
        setEmpLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  // Load history when employee is selected
  useEffect(() => {
    if (!selectedEmpNo) {
      setHistory([])
      return
    }
    async function fetchHistory() {
      try {
        setHistLoading(true)
        setHistError(null)
        const rows = await getEmployeeFullHistory(selectedEmpNo)
        setHistory(rows)
      } catch {
        setHistError('Failed to load job history.')
      } finally {
        setHistLoading(false)
      }
    }
    fetchHistory()
  }, [selectedEmpNo])

  // Filter employees by search term
  const filtered = employees.filter((e) => {
    const full = `${e.lastname} ${e.firstname} ${e.empno}`.toLowerCase()
    return full.includes(searchTerm.toLowerCase())
  })

  const selectedEmployee = employees.find((e) => e.empno === selectedEmpNo)

  const columns = [
    {
      key: 'effDate',
      label: 'Effective date',
      render: (val) => (
        <span className="font-mono text-xs text-gray-600">{formatDate(val)}</span>
      ),
    },
    { key: 'jobCode', label: 'Code' },
    { key: 'jobDesc', label: 'Job title' },
    { key: 'deptCode', label: 'Dept code' },
    { key: 'deptName', label: 'Department' },
    {
      key: 'salary',
      label: 'Salary',
      align: 'right',
      render: (val) => (
        <span className="font-medium text-gray-900">{formatSalary(val)}</span>
      ),
    },
  ]

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Employee Job History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select an employee to view their complete job history in chronological order.
        </p>
      </div>

      {/* Employee selector */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-700">Select employee</p>

        {empError && (
          <p className="mb-3 text-sm text-red-600">{empError}</p>
        )}

        {/* Search input */}
        <div className="relative mb-3">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or employee number…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Dropdown */}
        {empLoading ? (
          <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <select
            value={selectedEmpNo}
            onChange={(e) => setSelectedEmpNo(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">— Select an employee —</option>
            {filtered.map((e) => (
              <option key={e.empno} value={e.empno}>
                {e.lastname}, {e.firstname} ({e.empno})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected employee header */}
      {selectedEmployee && !histLoading && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              {selectedEmployee.lastname}, {selectedEmployee.firstname}
            </h2>
            <p className="text-xs text-gray-400 font-mono">{selectedEmployee.empno}</p>
          </div>
          <span className="text-xs text-gray-400">
            {history.length} {history.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}

      {/* History error */}
      {histError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{histError}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {histLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* History table */}
      {!histLoading && selectedEmpNo && (
        <ReportTable
          columns={columns}
          data={history}
          emptyMsg="No job history found for this employee."
        />
      )}

      {/* Empty prompt — no employee selected yet */}
      {!selectedEmpNo && !histLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <svg
            className="mb-3 h-8 w-8 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-sm text-gray-400">Select an employee above to view their history.</p>
        </div>
      )}
    </div>
  )
}