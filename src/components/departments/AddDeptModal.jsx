import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

const EMPTY = { deptCode: '', deptName: '' }

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

export default function AddDeptModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.deptCode.trim()) errs.deptCode = 'Department code is required.'
    else if (form.deptCode.trim().length > 10) errs.deptCode = 'Max 10 characters.'
    if (!form.deptName.trim()) errs.deptName = 'Department name is required.'
    else if (form.deptName.trim().length > 80) errs.deptName = 'Max 80 characters.'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setServerError('')

    const { error } = await supabase.from('departments').insert({
      dept_code: form.deptCode.trim().toUpperCase(),
      dept_name: form.deptName.trim(),
    })

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        setErrors({ deptCode: 'This department code already exists.' })
      } else {
        setServerError(error.message)
      }
      return
    }

    handleClose(true)
  }

  function handleClose(saved = false) {
    setForm(EMPTY)
    setErrors({})
    setServerError('')
    onClose()
    if (saved) onSuccess?.()
  }

  return (
    <Modal open={open} onClose={() => handleClose()} title="Add Department" size="md">
      <div className="space-y-4">
        {/* Dept Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Code <span className="text-red-500">*</span>
          </label>
          <input
            name="deptCode"
            value={form.deptCode}
            onChange={handleChange}
            maxLength={10}
            placeholder="e.g. ENG"
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              errors.deptCode ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
            }`}
          />
          <FieldError msg={errors.deptCode} />
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
            placeholder="e.g. Engineering"
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
            onClick={() => handleClose()}
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
            {saving ? 'Saving…' : 'Add Department'}
          </button>
        </div>
      </div>
    </Modal>
  )
}