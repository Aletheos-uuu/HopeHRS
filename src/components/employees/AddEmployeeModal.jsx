import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const GENDER_OPTIONS = ['M', 'F']

const EMPTY_FORM = {
  empno:     '',
  lastname:  '',
  firstname: '',
  gender:    '',
  hiredate:  '',
}

function FormField({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50'

export default function AddEmployeeModal({ open, onClose, onSuccess }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  if (!open) return null

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.empno.trim())    errs.empno    = 'Employee number is required'
    if (!form.lastname.trim()) errs.lastname = 'Last name is required'
    if (!form.firstname.trim()) errs.firstname = 'First name is required'
    if (!form.gender)           errs.gender   = 'Gender is required'
    if (!form.hiredate)         errs.hiredate = 'Hire date is required'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setApiError('')

    const { data, error } = await supabase
      .from('employee')
      .insert([{ ...form, record_status: 'ACTIVE' }])
      .select()
      .single()

    setSaving(false)

    if (error) {
      setApiError(error.message)
      return
    }

    setForm(EMPTY_FORM)
    onSuccess?.(data)
  }

  function handleClose() {
    setForm(EMPTY_FORM)
    setErrors({})
    setApiError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Add employee</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              {apiError}
            </div>
          )}

          <FormField label="Employee no." error={errors.empno}>
            <input
              className={inputCls}
              value={form.empno}
              onChange={(e) => set('empno', e.target.value)}
              placeholder="e.g. EMP-0001"
              disabled={saving}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Last name" error={errors.lastname}>
              <input
                className={inputCls}
                value={form.lastname}
                onChange={(e) => set('lastname', e.target.value)}
                disabled={saving}
              />
            </FormField>
            <FormField label="First name" error={errors.firstname}>
              <input
                className={inputCls}
                value={form.firstname}
                onChange={(e) => set('firstname', e.target.value)}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Gender" error={errors.gender}>
              <select
                className={inputCls}
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                disabled={saving}
              >
                <option value="">— select —</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Hire date" error={errors.hiredate}>
              <input
                type="date"
                className={inputCls}
                value={form.hiredate}
                onChange={(e) => set('hiredate', e.target.value)}
                disabled={saving}
              />
            </FormField>
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  )
}