import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

export default function EditDeptModal({ open, onClose, onSuccess, department }) {
  const [form, setForm] = useState({ deptName: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  // Seed from prop
  useEffect(() => {
    if (department) {
      setForm({ deptName: department.dept_name ?? '' })
      setErrors({})
      setServerError('')
    }
  }, [department])

  function handleChange(e) {
    setForm({ deptName: e.target.value })
    setErrors({})
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.deptName.trim()) errs.deptName = 'Department name is required.'
    else if (form.deptName.trim().length > 80) errs.deptName = 'Max 80 characters.'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setServerError('')

    const { error } = await supabase
      .from('departments')
      .update({ dept_name: form.deptName.trim() })
      .eq('dept_code', department.dept_code)

    setSaving(false)

    if (error) { setServerError(error.message); return }

    onClose()
    onSuccess?.()
  }

  if (!department) return null

  return (
    <Modal open={open} onClose={onClose} title="Edit Department" size="md">
      <div className="space-y-4">
        {/* Dept Code — read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
          <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500 font-mono tracking-wide">
            {department.dept_code}
          </div>
          <p className="mt-1 text-xs text-gray-400">Department code cannot be changed after creation.</p>
        </div>

        {/* Dept Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            name="deptName"
            value={form.deptName}
            onChange={handleChange}
            maxLength={80}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              errors.deptName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
            }`}
          />
          <FieldError msg={errors.deptName} />
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}