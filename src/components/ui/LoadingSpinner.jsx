/**
 * LoadingSpinner.jsx
 *
 * Shared loading spinner used across all pages.
 * Matches the violet-600 accent used throughout the app.
 *
 * Props:
 *   size    'sm' | 'md' (default) | 'lg'
 *   label   string — screen-reader text (default 'Loading…')
 *   full    boolean — if true, centers in a full min-h-[200px] container
 */
export default function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  full = false,
}) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-7 w-7 border-2',
    lg: 'h-10 w-10 border-[3px]',
  }

  const spinner = (
    <span role="status" aria-label={label} className="inline-flex flex-col items-center gap-2">
      <span
        className={`animate-spin rounded-full border-violet-200 border-t-violet-600 ${sizeClass[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  )

  if (full) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}