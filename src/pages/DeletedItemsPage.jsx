import { useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DeletedTab from '../components/deletedItems/DeletedTab'

// ─── Tab config ───────────────────────────────────────────────────────────────
// Table names, field names, and rowKeys all match the HopeDB schema exactly.
// recover() functions only update record_status — no business data is touched.

const TABS = [
  {
    id: 'employees',
    label: 'Employees',
    table: 'employee',              // FIX: was 'employees' — HopeDB table is 'employee'
    statusField: 'record_status',   // FIX: was 'status' — schema column is 'record_status'
    rowKey: 'empno',
    orderField: 'empno',
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
      // FIX: was updating wrong table ('employees') and wrong field ('status')
      // FIX: was nulling sepDate — recovery must only restore record_status;
      //      sepDate is business data and must not be altered on recovery.
      //      The cascade trigger on employee will automatically restore all
      //      their jobHistory rows to ACTIVE (see Section 7.2 of the guide).
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
    // FIX: was 'job_history' — HopeDB table is 'jobHistory'.
    // NOTE: Supabase may lowercase this to 'jobhistory' depending on M3's migration.
    // Coordinate with M3: if they quoted the name in CREATE TABLE it stays 'jobHistory';
    // if unquoted PostgreSQL folds it to 'jobhistory'. Use whichever M3 confirms.
    table: 'jobHistory',
    statusField: 'record_status',
    // FIX: was 'id' — jobHistory has a composite PK (empNo, jobCode, effDate), no 'id'.
    // rowKey is set to 'empNo' for UI identity (row highlighting/spinner).
    // orderField sorts by empNo then effDate for a readable deleted list.
    // recover() uses all three PK fields to target the exact row.
    rowKey: 'empNo',
    orderField: 'empNo',
    emptyMessage: 'No deleted job history records found.',
    columns: [
      {
        key: 'empNo',               // FIX: was 'empno' — schema column is 'empNo'
        label: 'Emp No',
        render: (row) => (
          <span className="font-mono text-xs text-gray-600 font-medium">{row.empNo}</span>
        ),
      },
      {
        key: 'effDate',             // FIX: was 'eff_date' — schema column is 'effDate'
        label: 'Eff Date',
        render: (row) => formatDate(row.effDate),
      },
      { key: 'jobCode',  label: 'Job Code' },   // FIX: was 'job_code'
      { key: 'deptCode', label: 'Dept Code' },  // FIX: was 'dept_code'
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
      // FIX: was querying 'job_history' with .eq('id', ...) — neither exists.
      // Must target the composite PK: (empNo, jobCode, effDate).
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
    table: 'job',                   // FIX: was 'jobs' — HopeDB table is 'job'
    statusField: 'record_status',
    rowKey: 'jobCode',              // FIX: was 'job_code' — schema column is 'jobCode'
    orderField: 'jobCode',
    emptyMessage: 'No deleted jobs found.',
    columns: [
      {
        key: 'jobCode',             // FIX: was 'job_code'
        label: 'Job Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.jobCode}
          </span>
        ),
      },
      { key: 'jobDesc', label: 'Description' }, // FIX: was 'job_desc' — schema is 'jobDesc'
    ],
    recover: async (row) => {
      // FIX: was querying 'jobs' with .eq('job_code', ...) — both wrong
      const { error } = await supabase
        .from('job')
        .update({ record_status: 'ACTIVE' })
        .eq('jobCode', row.jobCode)
      if (error) throw error
    },
  },
  {
    id: 'departments',
    label: 'Departments',
    table: 'department',            // FIX: was 'departments' — HopeDB table is 'department'
    statusField: 'record_status',
    rowKey: 'deptCode',             // FIX: was 'dept_code' — schema column is 'deptCode'
    orderField: 'deptCode',
    emptyMessage: 'No deleted departments found.',
    columns: [
      {
        key: 'deptCode',            // FIX: was 'dept_code'
        label: 'Dept Code',
        render: (row) => (
          <span className="font-mono text-xs text-gray-700 font-medium tracking-wide">
            {row.deptCode}
          </span>
        ),
      },
      { key: 'deptName', label: 'Department Name' }, // FIX: was 'dept_name' — schema is 'deptName'
    ],
    recover: async (row) => {
      // FIX: was querying 'departments' with .eq('dept_code', ...) — both wrong
      const { error } = await supabase
        .from('department')
        .update({ record_status: 'ACTIVE' })
        .eq('deptCode', row.deptCode)
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
  // FIX: was destructuring 'userRole' — AuthContext exposes currentUser with user_type.
  // The guard and showStamp prop both depend on user_type matching schema values
  // ('USER', 'ADMIN', 'SUPERADMIN'). Adjust the destructure to match your AuthContext shape.
  const { currentUser } = useAuth()
  const userType = currentUser?.user_type  // 'SUPERADMIN' | 'ADMIN' | 'USER'

  const [searchParams, setSearchParams] = useSearchParams()

  // ── Page-level guard ─────────────────────────────────────────────────────
  // FIX: was comparing userRole === 'USER'; now uses user_type from schema.
  // Also guards against an unauthenticated/null currentUser.
  if (!currentUser || userType === 'USER') return <Navigate to="/employees" replace />

  // ── URL-synced tab state ──────────────────────────────────────────────────
  const rawTab = searchParams.get('tab')
  const activeTabId = VALID_TAB_IDS.includes(rawTab) ? rawTab : TABS[0].id
  const activeTab = TABS.find((t) => t.id === activeTabId)

  function setTab(id) {
    setSearchParams({ tab: id }, { replace: true })
  }

  // Stamp column is visible to ADMIN and SUPERADMIN per Section 3.4 of the guide
  const showStamp = userType === 'ADMIN' || userType === 'SUPERADMIN'

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
        orderField={activeTab.orderField}   // FIX: pass orderField so sort doesn't break
        onRecover={activeTab.recover}
        emptyMessage={activeTab.emptyMessage}
        showStamp={showStamp}               // FIX: pass stamp visibility per user_type
      />
    </div>
  )
}