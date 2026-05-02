import { useState, useEffect } from 'react'
import { usePermission } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import AddDeptModal from '../components/departments/AddDeptModal'
import EditDeptModal from '../components/departments/EditDeptModal'

// ─── helpers ────────────────────────────────────────────────────────────────

function IconButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474L5.81 13.75a.75.75 0 0 1-.374.206l-3.5.875a.75.75 0 0 1-.911-.912l.875-3.5a.75.75 0 0 1 .206-.373L11.013 1.427ZM12.72 2.488a.25.25 0 0 0-.353 0L3.496 11.359l-.57 2.283 2.283-.571 8.87-8.871a.25.25 0 0 0 0-.353L12.72 2.488Z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
    </svg>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const canAdd  = usePermission('DEPT_ADD')
  const canEdit = usePermission('DEPT_EDIT')

  const [department, setDepartment] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [addOpen, setAddOpen]         = useState(false)
  const [editDept, setEditDept]       = useState(null)

  async function fetchDepartment() {
    setLoading(true)
    const { data, error } = await supabase
      .from('department')
      .select('dept_code, dept_name')
      .order('dept_code', { ascending: true })

    if (!error) setDepartment(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchDepartment() }, [])

  const filtered = department.filter((d) => {

    const q = search.toLowerCase()
    return (
      d.dept_code.toLowerCase().includes(q) ||
      d.dept_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="14" height="14" viewBox="0 0 16 16" fill="currentColor"
            >
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 w-52"
            />
          </div>

          {/* Add button */}
          {canAdd && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <PlusIcon />
              Add Department
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-36">
                  Dept Code
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Department Name
                </th>
                {canEdit && (
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 3 : 2} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 3 : 2} className="px-4 py-10 text-center text-sm text-gray-400">
                    {search ? 'No departments match your search.' : 'No departments found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((dept) => (
                  <tr key={dept.dept_code} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium tracking-wide">
                      {dept.dept_code}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{dept.dept_name}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <IconButton
                          onClick={() => setEditDept(dept)}
                          title="Edit department"
                        >
                          <EditIcon />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddDeptModal
        open={addOpen}
        onClose={() => setAddOpen(false)}

        onSuccess={fetchDepartment}

      />
      <EditDeptModal
        open={!!editDept}
        onClose={() => setEditDept(null)}
        onSuccess={() => { setEditDept(null); fetchDepartment() }}
        department={editDept}
      />
    </div>
  )
}