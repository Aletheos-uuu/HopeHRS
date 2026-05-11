import { useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DeletedTab from '../components/deletedItems/DeletedTab'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

function formatSalary(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'employees',
    label: 'Employees',
    table: 'employee',           // ✅ lowercase
    statusField: 'record_status',
    rowKey: 'empno',             // ✅ lowercase
    orderField: 'empno',
    emptyMessage: 'No deleted employees found.',
    columns: [
      {
        key: 'empno',            // ✅ lowercase
        label: 'Emp No',
        render: (row) => (
          <span className="font-mono text-xs text-gray-600 font-medium">
            {row.empno}
          </span>
        ),
      },
      {
        key: 'lastname',         // ✅ lowercase
        label: 'Last Name',
        render: (row) => (
          <span className="text-gray-900 font-medium">{row.lastname}</span>
        ),
      },
      { key: 'firstname', label: 'First Name' },
      { key: 'gender',    label: 'Gender' },
      {
        key: 'hiredate',         // ✅ lowercase
        label: 'Hire Date',
        render: (row) => formatDate(row.hiredate),
      },
      {
        key: 'sepdate',          // ✅ lowercase (was sepDate)
        label: 'Sep Date',
        render: (row) => formatDate(row.sepdate),
      },
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('employee')
        .update({ record_status: 'ACTIVE' })
        .eq('empno', row.empno)  // ✅ lowercase
      if (error) throw error
    },
  },

  {
    id: 'job-history',
    label: 'Job History',
    table: 'jobhistory',         // ✅ lowercase (was jobHistory)
    statusField: 'record_status',
    rowKey: 'empno',             // ✅ lowercase (was empNo) — composite PK, used for display only
    orderField: 'empno',
    emptyMessage: 'No deleted job history records found.',
    columns: [
      {
        key: 'empno',            // ✅ lowercase (was empNo)
        label: 'Emp No',
        render: (row) => (
          <span className="font-mono text-xs text-gray-600 font-medium">
            {row.empno}
          </span>
        ),
      },
      {
        key: 'effdate',          // ✅ lowercase (was effDate)
        label: 'Eff Date',
        render: (row) => formatDate(row.effdate),
      },
      { key: 'jobcode',  label: 'Job Code' },   // ✅ lowercase (was jobCode)
      { key: 'deptcode', label: 'Dept Code' },  // ✅ lowercase (was deptCode)
      {
        key: 'salary',
        label: 'Salary',
        render: (row) => formatSalary(row.salary),
      },
    ],
    recover: async (row) => {
      // jobhistory has composite PK: (empno, jobcode, effdate)
      const { error } = await supabase
        .from('jobhistory')          // ✅ lowercase
        .update({ record_status: 'ACTIVE' })
        .eq('empno', row.empno)      // ✅ lowercase
        .eq('jobcode', row.jobcode)  // ✅ lowercase
        .eq('effdate', row.effdate)  // ✅ lowercase
      if (error) throw error
    },
  },

  {
    id: 'jobs',
    label: 'Jobs',
    table: 'job',
    statusField: 'record_status',
    rowKey: 'jobcode',           // ✅ lowercase (was jobCode)
    orderField: 'jobcode',
    emptyMessage: 'No deleted jobs found.',
    columns: [
      {
        key: 'jobcode',          // ✅ lowercase (was jobCode)
        label: 'Job Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.jobcode}
          </span>
        ),
      },
      { key: 'jobdesc', label: 'Description' }, // ✅ lowercase (was jobDesc)
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('job')
        .update({ record_status: 'ACTIVE' })
        .eq('jobcode', row.jobcode)  // ✅ lowercase
      if (error) throw error
    },
  },

  {
    id: 'departments',
    label: 'Departments',
    table: 'department',
    statusField: 'record_status',
    rowKey: 'deptcode',          // ✅ lowercase (was deptCode)
    orderField: 'deptcode',
    emptyMessage: 'No deleted departments found.',
    columns: [
      {
        key: 'deptcode',         // ✅ lowercase (was deptCode)
        label: 'Dept Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.deptcode}
          </span>
        ),
      },
      { key: 'deptname', label: 'Department Name' }, // ✅ lowercase (was deptName)
    ],
    recover: async (row) => {
      const { error } = await supabase
        .from('department')
        .update({ record_status: 'ACTIVE' })
        .eq('deptcode', row.deptcode)  // ✅ lowercase
      if (error) throw error
    },
  },
]

const VALID_TAB_IDS = TABS.map((t) => t.id)

// ─── main page ────────────────────────────────────────────────────────────────

export default function DeletedItemsPage() {
  const { currentUser } = useAuth()
  const userType = currentUser?.user_type

  const [searchParams, setSearchParams] = useSearchParams()

  if (!currentUser || userType === 'USER') return <Navigate to="/employees" replace />

  const rawTab      = searchParams.get('tab')
  const activeTabId = VALID_TAB_IDS.includes(rawTab) ? rawTab : TABS[0].id
  const activeTab   = TABS.find((t) => t.id === activeTabId)

  function setTab(id) {
    setSearchParams({ tab: id }, { replace: true })
  }

  const showStamp = userType === 'ADMIN' || userType === 'SUPERADMIN'

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Deleted Items</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Recover inactive records across all entity types.
        </p>
      </div>

      {/* tab bar */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* active tab — key forces remount + refetch on tab switch */}
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