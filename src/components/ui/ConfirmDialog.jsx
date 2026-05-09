import { useEffect, useRef } from 'react'

/**
 * ConfirmDialog.jsx
 *
 * Generic confirmation modal.
 * Traps focus inside, closes on Escape, and locks body scroll.
 *
 * Props:
 *   isOpen    {boolean}   - controls visibility
 *   title     {string}    - dialog heading
 *   message   {string}    - body text / question
 *   confirmLabel {string} - confirm button label (default "Confirm")
 *   confirmStyle {string} - 'danger' | 'success' | 'primary' (default 'primary')
 *   onConfirm {function}  - called when user clicks confirm
 *   onCancel  {function}  - called when user clicks cancel or presses Escape
 *   isLoading {boolean}   - disables buttons and shows spinner on confirm
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const cancelRef = useRef(null)

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Focus cancel button on open
  useEffect(() => {
    if (isOpen) cancelRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  const confirmColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="confirm-dialog-title"
          className="text-base font-semibold text-gray-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 sm:w-auto ${confirmColors[confirmStyle] ?? confirmColors.primary}`}
          >
            {isLoading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}