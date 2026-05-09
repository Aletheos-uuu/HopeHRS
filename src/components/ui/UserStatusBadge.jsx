export default function UserStatusBadge({ status }) {
  const styles =
    status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
        }`}
      />
      {status}
    </span>
  )
}