import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SoftDeleteConfirmDialog({ open, employee, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false)
  const [apiError, setApiError] = useState('')

  if (!open || !employee) return null

  async function handleConfirm() {
  setDeleting(true)
  setApiError('')

  const today = new Date().toISOString().split('T')[0]
  const stamp = `DEL by ${employee.empno} on ${today}`

  const { error } = await supabase
    .from('employee')              // ✅ no s
    .update({
      record_status: 'INACTIVE',   // ✅ correct column
      sepdate: today,              // ✅ lowercase
      stamp: stamp.slice(0, 60),  // ✅ within VARCHAR(60)
    })
    .eq('empno', employee.empno)

  setDeleting(false)

  if (error) {
    setApiError(error.message)
    return
  }

  onSuccess?.(employee.empno)
}

  function handleClose() {
    if (deleting) return
    setApiError('')
    onClose()
  }

  const displayName = [employee.firstname, employee.lastname].filter(Boolean).join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          {/* warning icon */}
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500"
            >
              <path
                d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900">Deactivate employee?</h2>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{displayName}</span>{' '}
              <span className="font-mono text-xs text-gray-400">({employee.empno})</span>{' '}
              will be marked <span className="font-medium">INACTIVE</span> and their
              separation date will be set to today. This can be reversed by editing the record.
            </p>
          </div>
        </div>

        {/* error */}
        {apiError && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
            {apiError}
          </div>
        )}

        {/* footer */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deactivating…' : 'Yes, deactivate'}
          </button>
        </div>
      </div>
    </div>
  )
}