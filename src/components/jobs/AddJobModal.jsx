import { useState } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

const EMPTY = { jobCode: '', jobDesc: '', record_status: 'ACTIVE' }

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

export default function AddJobModal({ open, onClose, onSuccess }) {
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
    if (!form.jobCode.trim()) errs.jobCode = 'Job code is required.'
    else if (form.jobCode.trim().length > 20) errs.jobCode = 'Max 20 characters.'
    if (!form.jobDesc.trim()) errs.jobDesc = 'Job description is required.'
    else if (form.jobDesc.trim().length > 100) errs.jobDesc = 'Max 100 characters.'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setServerError('')

    const { error } = await supabase.from('jobs').insert({
      job_code: form.jobCode.trim().toUpperCase(),
      job_desc: form.jobDesc.trim(),
      record_status: form.record_status,
    })

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        setErrors({ jobCode: 'This job code already exists.' })
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
    <Modal open={open} onClose={() => handleClose()} title="Add Job" size="md">
      <div className="space-y-4">
        {/* Job Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Code <span className="text-red-500">*</span>
          </label>
          <input
            name="jobCode"
            value={form.jobCode}
            onChange={handleChange}
            maxLength={20}
            placeholder="e.g. DEV-SR"
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              errors.jobCode ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
            }`}
          />
          <FieldError msg={errors.jobCode} />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description <span className="text-red-500">*</span>
          </label>
          <input
            name="jobDesc"
            value={form.jobDesc}
            onChange={handleChange}
            maxLength={100}
            placeholder="e.g. Senior Developer"
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              errors.jobDesc ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
            }`}
          />
          <FieldError msg={errors.jobDesc} />
        </div>

        {/* Record Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="record_status"
            value={form.record_status}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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
            {saving ? 'Saving…' : 'Add Job'}
          </button>
        </div>
      </div>
    </Modal>
  )
}