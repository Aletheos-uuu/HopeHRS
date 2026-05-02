import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { usePermission, useAuth } from "../../context/AuthContext";
import AddJobHistoryForm from "./AddJobHistoryForm";
import EditJobHistoryModal from "./EditJobHistoryModal";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function formatSalary(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── icons ───────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474L5.81 13.75a.75.75 0 0 1-.374.206l-3.5.875a.75.75 0 0 1-.911-.912l.875-3.5a.75.75 0 0 1 .206-.373L11.013 1.427ZM12.72 2.488a.25.25 0 0 0-.353 0L3.496 11.359l-.57 2.283 2.283-.571 8.87-8.871a.25.25 0 0 0 0-.353L12.72 2.488Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
    </svg>
  );
}

// ─── soft-delete confirm ──────────────────────────────────────────────────────

function DeleteConfirm({ row, onConfirm, onCancel, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* warning icon */}
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-900">
            Remove job history entry?
          </p>
          <p className="text-xs text-gray-500">
            Effective{" "}
            <span className="font-medium text-gray-700">
              {formatDate(row.effDate)}
            </span>
            {" · "}
            <span className="font-medium text-gray-700">
              {row.jobDesc ?? row.jobCode}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This will be soft-deleted and recoverable by an admin.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-3-3v6M4.5 19.5l15-15"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400">No job history records found.</p>
    </div>
  );
}

// ─── main panel ──────────────────────────────────────────────────────────────

export default function JobHistoryPanel({ empNo }) {
  const canAdd = usePermission("JH_ADD");
  const canEdit = usePermission("JH_EDIT");
  const canDel = usePermission("JH_DEL");
  const { currentUser } = useAuth();

  const [rows, setRows] = useState([]);
  const [job, setJob] = useState({}); // jobCode → jobDesc
  const [depts, setDepts] = useState({}); // deptCode → deptName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editTarget, setEditTarget] = useState(null); // JH row being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // JH row pending delete
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: jhData, error: jhErr },
        { data: jobData, error: jobErr },
        { data: deptData, error: deptErr },
      ] = await Promise.all([
        supabase
          .from("jobHistory")
          .select("*")
          .eq("empNo", empNo)
          .eq("record_status", "ACTIVE") // soft-delete filter — this is enough
          .order("effDate", { ascending: false }),
        supabase
          .from("job") // singular — matches HopeDB schema
          .select("jobCode, jobDesc"),
        supabase.from("department").select("deptCode, deptName"),
      ]);

      if (jhErr) throw jhErr;
      if (jobErr) throw jobErr;
      if (deptErr) throw deptErr;

      setJob(
        Object.fromEntries((jobData ?? []).map((j) => [j.jobCode, j.jobDesc])),
      );
      setDepts(
        Object.fromEntries(
          (deptData ?? []).map((d) => [d.deptCode, d.deptName]),
        ),
      );
      setRows(jhData ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [empNo]);

  // ── soft-delete ────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("jobHistory")
        .update({
          record_status: "INACTIVE",
          stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`,
        })
        .eq("empNo", deleteTarget.empNo)
        .eq("jobCode", deleteTarget.jobCode)
        .eq("effDate", deleteTarget.effDate);
      // TODO: adjust PK column name if different

      if (error) throw error;
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const hasActions = canEdit || canDel;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* panel header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Job History</h2>
          {!loading && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              {rows.length}
            </span>
          )}
        </div>

        {canAdd && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
            </svg>
            Add Entry
          </button>
        )}
      </div>

      {/* add form (inline, collapsible) */}
      {canAdd && showAddForm && (
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <AddJobHistoryForm
            empNo={empNo}
            job={job}
            depts={depts}
            onSuccess={() => {
              setShowAddForm(false);
              fetchAll();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* table */}
      {loading ? (
        <div className="px-6 py-10 space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-6 text-sm text-red-600">{error}</div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Eff. Date", "Job", "Department", "Salary", "Stamp"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400"
                    >
                      {h}
                    </th>
                  ),
                )}
                {hasActions && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(row.effDate)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-gray-800">
                      {job[row.jobCode] ?? row.jobCode ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">
                    {depts[row.deptCode] ?? row.deptCode ?? "—"}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 tabular-nums">
                    {formatSalary(row.salary)}
                  </td>
                  <td className="px-6 py-3.5">
                    {row.stamp ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                        {row.stamp}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  {hasActions && (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                          <button
                            onClick={() => setEditTarget(row)}
                            title="Edit entry"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <EditIcon />
                          </button>
                        )}
                        {canDel && (
                          <button
                            onClick={() => setDeleteTarget(row)}
                            title="Remove entry"
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* modals */}
      {editTarget && (
        <EditJobHistoryModal
          row={editTarget}
          job={job}
          depts={depts}
          onSuccess={() => {
            setEditTarget(null);
            fetchAll();
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          row={{ ...deleteTarget, jobDesc: job[deleteTarget.jobCode] }}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}