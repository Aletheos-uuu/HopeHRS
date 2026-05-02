import { useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DeletedTab from '../components/deletedItems/DeletedTab'

// ─── Tab config ───────────────────────────────────────────────────────────────
// Each tab declares: id, label, and everything DeletedTab needs.
// recover() functions return a resolved/rejected promise so DeletedTab
// can handle spinner + error state uniformly.

const TABS = [
  {
    id: 'employees',
    label: 'Employees',
    table: 'employees',
    statusField: 'status',
    rowKey: 'empno',
    emptyMessage: 'No deleted employees found.',
    columns: [
      {
        key: 'empno',
        label: 'Emp No',
        render: (row) => (
          <span className="font-mono text-xs text-gray-600 font-medium">{row.empno}</span>
        ),
      },
      {
        key: 'lastname',
        label: 'Last Name',
        render: (row) => <span className="text-gray-900 font-medium">{row.lastname}</span>,
      },
      { key: 'firstname', label: 'First Name' },
      { key: 'gender',    label: 'Gender' },
      {
        key: 'hiredate',
        label: 'Hire Date',
        render: (row) => formatDate(row.hiredate),
      },
      {
        key: 'sepDate',
        label: 'Sep Date',
        render: (row) => formatDate(row.sepDate),
      },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('employees')
        .update({ status: 'ACTIVE', sepDate: null })
        .eq('empno', row.empno)
      if (error) throw error
    },
  },
  {
    id: 'job-history',
    label: 'Job History',
    table: 'job_history',
    statusField: 'record_status',
    rowKey: 'id',
    emptyMessage: 'No deleted job history records found.',
    columns: [
      {
        key: 'empno',
        label: 'Emp No',
        render: (row) => (
          <span className="font-mono text-xs text-gray-600 font-medium">{row.empno}</span>
        ),
      },
      {
        key: 'eff_date',
        label: 'Eff Date',
        render: (row) => formatDate(row.eff_date),
      },
      { key: 'job_code',  label: 'Job Code' },
      { key: 'dept_code', label: 'Dept Code' },
      {
        key: 'salary',
        label: 'Salary',
        render: (row) =>
          row.salary != null
            ? new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                maximumFractionDigits: 0,
              }).format(row.salary)
            : '—',
      },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('job_history')
        .update({ record_status: 'ACTIVE' })
        .eq('id', row.id)
      if (error) throw error
    },
  },
  {
    id: 'jobs',
    label: 'Jobs',
    table: 'jobs',
    statusField: 'record_status',
    rowKey: 'job_code',
    emptyMessage: 'No deleted jobs found.',
    columns: [
      {
        key: 'job_code',
        label: 'Job Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.job_code}
          </span>
        ),
      },
      { key: 'job_desc', label: 'Description' },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('jobs')
        .update({ record_status: 'ACTIVE' })
        .eq('job_code', row.job_code)
      if (error) throw error
    },
  },
  {
    id: 'departments',
    label: 'Departments',
    table: 'departments',
    statusField: 'record_status',
    rowKey: 'dept_code',
    emptyMessage: 'No deleted departments found.',
    columns: [
      {
        key: 'dept_code',
        label: 'Dept Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.dept_code}
          </span>
        ),
      },
      { key: 'dept_name', label: 'Department Name' },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('departments')
        .update({ record_status: 'ACTIVE' })
        .eq('dept_code', row.dept_code)
      if (error) throw error
    },
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

const VALID_TAB_IDS = TABS.map((t) => t.id)

// ─── main page ────────────────────────────────────────────────────────────────

export default function DeletedItemsPage() {
  const { userRole } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Page-level guard ────────────────────────────────────────────────────
  if (userRole === 'USER') return <Navigate to="/" replace />

  // ── URL-synced tab state ─────────────────────────────────────────────────
  const rawTab = searchParams.get('tab')
  const activeTabId = VALID_TAB_IDS.includes(rawTab) ? rawTab : TABS[0].id
  const activeTab = TABS.find((t) => t.id === activeTabId)

  function setTab(id) {
    setSearchParams({ tab: id }, { replace: true })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Deleted Items</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Recover inactive records across all entity types.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-md text-sm font-medium transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400
                ${isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Active tab content */}
      {/* Key on activeTabId so DeletedTab remounts + refetches on tab switch */}
      <DeletedTab
        key={activeTabId}
        table={activeTab.table}
        statusField={activeTab.statusField}
        columns={activeTab.columns}
        rowKey={activeTab.rowKey}
        onRecover={activeTab.recover}
        emptyMessage={activeTab.emptyMessage}
      />
    </div>
  )
}