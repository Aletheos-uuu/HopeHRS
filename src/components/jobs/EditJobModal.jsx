import { useState, useEffect } from 'react'
import Modal from '../Modal'
import { supabase } from '../../lib/supabaseClient'

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

export default function EditJobModal({ open, onClose, onSuccess, job }) {
  const [form, setForm] = useState({ jobDesc: '', record_status: 'ACTIVE' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  // Seed from prop
  useEffect(() => {
    if (job) {
      setForm({
        jobDesc: job.jobDesc ?? '',

        record_status: job.record_status ?? 'ACTIVE',
      })
      setErrors({})
      setServerError('')
    }
  }, [job])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.jobDesc.trim()) errs.jobDesc = 'Job description is required.'
    else if (form.jobDesc.trim().length > 100) errs.jobDesc = 'Max 100 characters.'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setServerError('')

    const { error } = await supabase

      .from('job')
      .update({
        jobDesc: form.jobDesc.trim(),
        record_status: form.record_status,
      })
      .eq('jobCode', job.jobCode)


    setSaving(false)

    if (error) { setServerError(error.message); return }

    onClose()
    onSuccess?.()
  }

  if (!job) return null

  return (
    <Modal open={open} onClose={onClose} title="Edit Job" size="md">
      <div className="space-y-4">
        {/* Job Code — read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Code</label>
          <div className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500 font-mono tracking-wide">
            {job.jobCode}

          </div>
          <p className="mt-1 text-xs text-gray-400">Job code cannot be changed after creation.</p>
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
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              errors.jobDesc ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
            }`}
          />
          <FieldError msg={errors.jobDesc} />
        </div>

        {/* Record Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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