import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

// ─── field components ─────────────────────────────────────────────────────────

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-600 mb-1">
      {children}
    </label>
  )
}

function Input({ id, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full px-3 py-2 rounded-lg border text-sm text-gray-800
        placeholder:text-gray-300 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow
        ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'border-gray-200'}
      `}
    />
  )
}

function Select({ id, value, onChange, children, disabled }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2 rounded-lg border text-sm text-gray-800 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow appearance-none
        ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'border-gray-200'}
      `}
    >
      {children}
    </select>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-500">{message}</p>
}

// ─── modal ────────────────────────────────────────────────────────────────────

export default function EditJobHistoryModal({ row, jobs, depts, onSuccess, onClose }) {
  const [form, setForm]       = useState({ effDate: '', jobCode: '', deptCode: '', salary: '' })
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [apiError, setApiError] = useState(null)

  const jobOptions  = Object.entries(jobs)
  const deptOptions = Object.entries(depts)

  // seed from row
  useEffect(() => {
    if (row) {
      setForm({
        effDate:  row.effDate  ?? '',
        jobCode:  row.jobCode  ?? '',
        deptCode: row.deptCode ?? '',
        salary:   row.salary != null ? String(row.salary) : '',
      })
      setErrors({})
      setApiError(null)
    }
  }, [row])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.effDate)  errs.effDate  = 'Effective date is required.'
    if (!form.jobCode)  errs.jobCode  = 'Job is required.'
    if (!form.deptCode) errs.deptCode = 'Department is required.'
    if (form.salary && isNaN(Number(form.salary))) errs.salary = 'Must be a number.'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setApiError(null)
    try {
      const payload = {
        effDate:  form.effDate,
        jobCode:  form.jobCode,
        deptCode: form.deptCode,
        salary:   form.salary ? Number(form.salary) : null,
      }

      const { error } = await supabase
        .from('job_history')
        .update(payload)
        .eq('id', row.id)   // TODO: adjust PK column name if needed

      if (error) throw error
      onSuccess()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={saving ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Edit Job History Entry</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">Employee #{row?.empno}</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Effective Date */}
            <div>
              <Label htmlFor="edit-effDate">Effective Date *</Label>
              <Input
                id="edit-effDate"
                type="date"
                value={form.effDate}
                onChange={(e) => set('effDate', e.target.value)}
              />
              <FieldError message={errors.effDate} />
            </div>

            {/* Salary */}
            <div>
              <Label htmlFor="edit-salary">Salary</Label>
              <Input
                id="edit-salary"
                type="number"
                value={form.salary}
                onChange={(e) => set('salary', e.target.value)}
                placeholder="e.g. 60000"
              />
              <FieldError message={errors.salary} />
            </div>

            {/* Job */}
            <div>
              <Label htmlFor="edit-jobCode">Job *</Label>
              <Select
                id="edit-jobCode"
                value={form.jobCode}
                onChange={(e) => set('jobCode', e.target.value)}
              >
                <option value="">Select job…</option>
                {jobOptions.map(([code, desc]) => (
                  <option key={code} value={code}>{desc}</option>
                ))}
              </Select>
              <FieldError message={errors.jobCode} />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="edit-deptCode">Department *</Label>
              <Select
                id="edit-deptCode"
                value={form.deptCode}
                onChange={(e) => set('deptCode', e.target.value)}
              >
                <option value="">Select department…</option>
                {deptOptions.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </Select>
              <FieldError message={errors.deptCode} />
            </div>
          </div>

          {/* read-only stamp */}
          {row?.stamp && (
            <div>
              <Label>Stamp</Label>
              <div className="px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs font-mono text-gray-400">
                {row.stamp}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}