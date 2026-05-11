/**
 * TableSkeleton.jsx
 *
 * Animated shimmer placeholder rendered inside a table <tbody>
 * while data is loading. Prevents layout jump by preserving the
 * table structure and approximate row height.
 *
 * Props:
 *   rows     number  — how many skeleton rows to show (default 5)
 *   cols     number  — how many columns to span (required)
 */
export default function TableSkeleton({ rows = 5, cols }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          <td colSpan={cols} className="px-4 py-2.5">
            <div className="h-5 w-full animate-pulse rounded-md bg-gray-100" />
          </td>
        </tr>
      ))}
    </>
  )
}