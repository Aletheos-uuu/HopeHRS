import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'

/**
 * DeletedTab — reusable template for all four Deleted Items tabs.
 *
 * Props:
 *   table        string   — Supabase table name to query
 *   statusField  string   — field to filter on ('status' | 'record_status')
 *   columns      Array<{ key: string, label: string, render?: fn }>
 *                         — column definitions; render(row) optional for custom cells
 *   rowKey       string   — unique row identifier field (e.g. 'empno', 'id', 'job_code')
 *   onRecover    fn(row)  — async fn that performs the restore; must resolve/reject
 *   emptyMessage string   — shown when no deleted records found
 */
export default function DeletedTab({
  table,
  statusField = 'record_status',
  columns,
  rowKey,
  onRecover,
  emptyMessage = 'No deleted records found.',
}) {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [recovering, setRecovering] = useState(null) // rowKey value of in-flight row

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchErr } = await supabase
      .from(table)
      .select('*')
      .eq(statusField, 'INACTIVE')
      .order(rowKey, { ascending: true })

    if (fetchErr) {
      setError(fetchErr.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }, [table, statusField, rowKey])

  useEffect(() => { fetchRows() }, [fetchRows])

  async function handleRecover(row) {
    setRecovering(row[rowKey])
    try {
      await onRecover(row)
      await fetchRows()
    } catch (err) {
      setError(err?.message ?? 'Recovery failed.')
    } finally {
      setRecovering(null)
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
          <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
        <span>{error}</span>
        <button
          onClick={fetchRows}
          className="ml-auto text-xs underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-12 text-center">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray-300">
            <path
              d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-28">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => {
              const id = row[rowKey]
              const isRecovering = recovering === id
              return (
                <tr
                  key={id}
                  className={`transition-colors ${isRecovering ? 'opacity-50' : 'hover:bg-gray-50/60'}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRecover(row)}
                      disabled={isRecovering || !!recovering}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRecovering ? (
                        <>
                          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                            <path d="M22 12c0-5.523-4.477-10-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Restoring…
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z" />
                          </svg>
                          Recover
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Row count footer */}
      <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50">
        <p className="text-xs text-gray-400">
          {rows.length} deleted record{rows.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}