import { useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DeletedTab from '../components/deletedItems/DeletedTab'

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'employees',
    label: 'Employees',
    table: 'employee',
    statusField: 'record_status',
    rowKey: 'empno',
    orderField: 'empno',
    emptyMessage: 'No deleted employees found.',
    columns: [
      { key: 'empno',     label: 'Emp No',     render: (row) => <span className="font-mono text-xs text-gray-600 font-medium">{row.empno}</span> },
      { key: 'lastname',  label: 'Last Name',  render: (row) => <span className="text-gray-900 font-medium">{row.lastname}</span> },
      { key: 'firstname', label: 'First Name' },
      { key: 'gender',    label: 'Gender' },
      { key: 'hiredate',  label: 'Hire Date',  render: (row) => formatDate(row.hiredate) },
      { key: 'sepDate',   label: 'Sep Date',   render: (row) => formatDate(row.sepDate) },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('employee')
        .update({ record_status: 'ACTIVE' })
        .eq('empno', row.empno)
      if (error) throw error
    },
  },
  {
    id: 'job-history',
    label: 'Job History',
    table: 'jobHistory',
    statusField: 'record_status',
    rowKey: 'empNo',
    orderField: 'empNo',
    emptyMessage: 'No deleted job history records found.',
    columns: [
      { key: 'empNo',    label: 'Emp No',    render: (row) => <span className="font-mono text-xs text-gray-600 font-medium">{row.empNo}</span> },
      { key: 'effDate',  label: 'Eff Date',  render: (row) => formatDate(row.effDate) },
      { key: 'jobCode',  label: 'Job Code' },
      { key: 'deptCode', label: 'Dept Code' },
      {
        key: 'salary',
        label: 'Salary',
        render: (row) =>
          row.salary != null
            ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(row.salary)
            : '—',
      },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('jobHistory')
        .update({ record_status: 'ACTIVE' })
        .eq('empNo', row.empNo)
        .eq('jobCode', row.jobCode)
        .eq('effDate', row.effDate)
      if (error) throw error
    },
  },
  {
    id: 'jobs',
    label: 'Jobs',
    table: 'job',
    statusField: 'record_status',
    rowKey: 'jobCode',
    orderField: 'jobCode',
    emptyMessage: 'No deleted jobs found.',
    columns: [
      { key: 'jobCode', label: 'Job Code',    render: (row) => <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">{row.jobCode}</span> },
      { key: 'jobDesc', label: 'Description' },
    ],
    recover: async (row) => {
      const { error } = await supabase.from('job').update({ record_status: 'ACTIVE' }).eq('jobCode', row.jobCode)
      if (error) throw error
    },
  },
  {
    id: 'departments',
    label: 'Departments',
    table: 'department',
    statusField: 'record_status',
    rowKey: 'deptCode',
    orderField: 'deptCode',
    emptyMessage: 'No deleted departments found.',
    columns: [
      { key: 'deptCode', label: 'Dept Code',       render: (row) => <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">{row.deptCode}</span> },
      { key: 'deptName', label: 'Department Name' },
    ],
    recover: async (row) => {
      const { error } = await supabase.from('department').update({ record_status: 'ACTIVE' }).eq('deptCode', row.deptCode)
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
  const { currentUser } = useAuth()
  const userType = currentUser?.user_type

  const [searchParams, setSearchParams] = useSearchParams()

  if (!currentUser || userType === 'USER') return <Navigate to="/employees" replace />

  const rawTab     = searchParams.get('tab')
  const activeTabId = VALID_TAB_IDS.includes(rawTab) ? rawTab : TABS[0].id
  const activeTab  = TABS.find((t) => t.id === activeTabId)

  function setTab(id) {
    setSearchParams({ tab: id }, { replace: true })
  }

  const showStamp = userType === 'ADMIN' || userType === 'SUPERADMIN'

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Deleted Items</h1>
        <p className="text-sm text-gray-500 mt-0.5">Recover inactive records across all entity types.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Active tab — key forces remount + refetch on tab switch */}
      <DeletedTab
        key={activeTabId}
        table={activeTab.table}
        statusField={activeTab.statusField}
        columns={activeTab.columns}
        rowKey={activeTab.rowKey}
        orderField={activeTab.orderField}
        onRecover={activeTab.recover}
        emptyMessage={activeTab.emptyMessage}
        showStamp={showStamp}
      />
    </div>
  )
}