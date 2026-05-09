/**
 * UserTypeBadge.jsx
 *
 * Color-coded pill badge for user_type.
 * SUPERADMIN → purple
 * ADMIN      → indigo (matches sidebar accent)
 * USER       → gray
 */
const TYPE_STYLES = {
  SUPERADMIN: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  ADMIN: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  USER: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

const TYPE_LABELS = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
  USER: 'User',
}

export default function UserTypeBadge({ userType }) {
  const styles = TYPE_STYLES[userType] ?? TYPE_STYLES.USER
  const label = TYPE_LABELS[userType] ?? userType

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  )
}