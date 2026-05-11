import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { usePermission, useAuth } from "../context/AuthContext";

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

function makeStamp(action, email) {
  const date = new Date().toISOString().slice(0, 10); // "2026-05-12" not full ISO
  const stamp =
    `${action} by ${email} on ${new Date().toISOString().slice(0, 10)}`.slice(
      0,
      60,
    );
  return stamp.slice(0, 60); // hard cap at VARCHAR(60)
}

// ─── icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      />
    </svg>
  );
}

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

function ChevronIcon({ dir = "down" }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform ${dir === "up" ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
    </svg>
  );
}

// ─── edit modal ───────────────────────────────────────────────────────────────

function EditModal({ row, jobs, depts, onSuccess, onClose }) {
  const { currentUser } = useAuth();
  const [salary, setSalary] = useState(String(row.salary ?? ""));
  const [deptcode, setDeptcode] = useState(row.deptcode ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSave() {
    const parsed = parseFloat(salary);
    if (isNaN(parsed) || parsed < 0) {
      setErr("Salary must be a non-negative number.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const { error } = await supabase
        .from("jobhistory")
        .update({
          salary: parsed,
          deptcode,
          stamp: makeStamp("EDITED", currentUser.email),
        })
        .eq("empno", row.empno)
        .eq("jobcode", row.jobcode)
        .eq("effdate", row.effdate);
      if (error) throw error;
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Edit Job History Entry
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {row.empno} · {jobs[row.jobcode] ?? row.jobcode} ·{" "}
            {formatDate(row.effdate)}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Salary
            </label>
            <input
              type="number"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Department
            </label>
            <select
              value={deptcode}
              onChange={(e) => setDeptcode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.entries(depts).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {err && <p className="text-xs text-red-600">{err}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ row, jobs, onConfirm, onCancel, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
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
            Remove this job history entry?
          </p>
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{row.empno}</span>
            {" · "}
            <span className="font-medium text-gray-700">
              {jobs[row.jobcode] ?? row.jobcode}
            </span>
            {" · "}
            <span className="font-medium text-gray-700">
              {formatDate(row.effdate)}
            </span>
          </p>
          <p className="text-xs text-gray-400">
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

// ─── skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-50">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex gap-6">
          <div className="h-3.5 bg-gray-100 rounded w-16" />
          <div className="h-3.5 bg-gray-100 rounded w-28" />
          <div className="h-3.5 bg-gray-100 rounded w-20" />
          <div className="h-3.5 bg-gray-100 rounded w-24" />
          <div className="h-3.5 bg-gray-100 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

const SORT_FIELDS = {
  effdate: "effdate",
  empno: "empno",
  jobcode: "jobcode",
  salary: "salary",
};

export default function JobHistoryPage() {
  const navigate = useNavigate();
  const canEdit = usePermission("JH_EDIT");
  const canDel = usePermission("JH_DEL");
  const { currentUser } = useAuth();
  const showStamp = currentUser?.user_type !== "USER";

  const [rows, setRows] = useState([]);
  const [jobs, setJobs] = useState({});
  const [depts, setDepts] = useState({});
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");
  const [sortField, setSortField] = useState("effdate");
  const [sortAsc, setSortAsc] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: jhData, error: jhErr },
        { data: jobData, error: jobErr },
        { data: deptData, error: deptErr },
        { data: empData, error: empErr },
      ] = await Promise.all([
        supabase
          .from("jobhistory")
          .select("*")
          .eq("record_status", "ACTIVE")
          .order("effdate", { ascending: false }),
        supabase
          .from("job")
          .select("jobcode, jobdesc")
          .eq("record_status", "ACTIVE"),
        supabase
          .from("department")
          .select("deptcode, deptname")
          .eq("record_status", "ACTIVE"),
        supabase
          .from("employee")
          .select("empno, firstname, lastname")
          .eq("record_status", "ACTIVE"),
      ]);

      if (jhErr) throw jhErr;
      if (jobErr) throw jobErr;
      if (deptErr) throw deptErr;
      if (empErr) throw empErr;

      setJobs(
        Object.fromEntries((jobData ?? []).map((j) => [j.jobcode, j.jobdesc])),
      );
      setDepts(
        Object.fromEntries(
          (deptData ?? []).map((d) => [d.deptcode, d.deptname]),
        ),
      );
      setEmployees(
        Object.fromEntries(
          (empData ?? []).map((e) => [e.empno, `${e.firstname} ${e.lastname}`]),
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
  }, []);

  // ── soft-delete ────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("jobhistory")
        .update({
          record_status: "INACTIVE",
          stamp:
            `DEL by ${currentUser.email} on ${new Date().toISOString().slice(0, 10)}`.slice(
              0,
              60,
            ),
        })
        .eq("empno", deleteTarget.empno)
        .eq("jobcode", deleteTarget.jobcode)
        .eq("effdate", deleteTarget.effdate);
      if (error) throw error;
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  // ── sort toggle ────────────────────────────────────────────────────────────

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc((a) => !a);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  // ── filtered + sorted rows ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows
      .filter((r) => {
        const empName = (employees[r.empno] ?? "").toLowerCase();
        const jobDesc = (jobs[r.jobcode] ?? "").toLowerCase();
        const deptName = (depts[r.deptcode] ?? "").toLowerCase();
        const matchSearch =
          !q ||
          r.empno.includes(q) ||
          empName.includes(q) ||
          r.jobcode.toLowerCase().includes(q) ||
          jobDesc.includes(q) ||
          deptName.includes(q);
        const matchJob = filterJob === "ALL" || r.jobcode === filterJob;
        const matchDept = filterDept === "ALL" || r.deptcode === filterDept;
        return matchSearch && matchJob && matchDept;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === "salary") {
          aVal = parseFloat(aVal ?? 0);
          bVal = parseFloat(bVal ?? 0);
        } else {
          aVal = String(aVal ?? "");
          bVal = String(bVal ?? "");
        }
        if (aVal < bVal) return sortAsc ? -1 : 1;
        if (aVal > bVal) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    rows,
    search,
    filterJob,
    filterDept,
    sortField,
    sortAsc,
    employees,
    jobs,
    depts,
  ]);

  // ── column header ──────────────────────────────────────────────────────────

  function SortHeader({ field, children }) {
    const active = sortField === field;
    return (
      <th
        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 cursor-pointer select-none hover:text-gray-600 transition-colors"
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          <span className={active ? "text-indigo-500" : "text-gray-300"}>
            <ChevronIcon dir={active && !sortAsc ? "up" : "down"} />
          </span>
        </span>
      </th>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const hasActions = canEdit || canDel;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Job History
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Track each employee's progression through jobs, departments,
              salaries, and effective dates.
            </p>
          </div>
          {!loading && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {filtered.length} of {rows.length} records
            </span>
          )}
        </div>

        {/* filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by employee, job, or department…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* job filter */}
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            >
              <option value="ALL">All Jobs</option>
              {Object.entries(jobs).map(([code, desc]) => (
                <option key={code} value={code}>
                  {desc} ({code})
                </option>
              ))}
            </select>

            {/* dept filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            >
              <option value="ALL">All Departments</option>
              {Object.entries(depts).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>

            {/* clear */}
            {(search || filterJob !== "ALL" || filterDept !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterJob("ALL");
                  setFilterDept("ALL");
                }}
                className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="px-6 py-8 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-400">
                No job history records match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[560px] sm:min-w-[720px] lg:min-w-full w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <SortHeader field="empno">Employee</SortHeader>
                    <SortHeader field="jobcode">Job</SortHeader>
                    <SortHeader field="effdate">Eff. Date</SortHeader>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      Department
                    </th>
                    <SortHeader field="salary">Salary</SortHeader>
                    {showStamp && (
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        Stamp
                      </th>
                    )}
                    {hasActions && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((row, idx) => (
                    <tr
                      key={`${row.empno}-${row.jobcode}-${row.effdate}` ?? idx}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* employee */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate(`/employees/${row.empno}`)}
                          className="text-left group/emp"
                        >
                          <p className="font-medium text-gray-900 group-hover/emp:text-indigo-600 transition-colors">
                            {employees[row.empno] ?? row.empno}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {row.empno}
                          </p>
                        </button>
                      </td>

                      {/* job */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800">
                          {jobs[row.jobcode] ?? row.jobcode}
                        </span>
                        <span className="ml-1.5 text-xs text-gray-400 font-mono">
                          {row.jobcode}
                        </span>
                      </td>

                      {/* eff date */}
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(row.effdate)}
                      </td>

                      {/* department */}
                      <td className="px-5 py-3.5 text-gray-600">
                        {depts[row.deptcode] ?? row.deptcode ?? "—"}
                      </td>

                      {/* salary */}
                      <td className="px-5 py-3.5 text-gray-700 tabular-nums font-medium">
                        {formatSalary(row.salary)}
                      </td>

                      {/* stamp */}
                      {showStamp && (
                        <td className="px-5 py-3.5 max-w-[180px]">
                          {row.stamp ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 truncate max-w-full">
                              {row.stamp}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      )}

                      {/* actions */}
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
        </div>
      </div>

      {/* modals */}
      {editTarget && (
        <EditModal
          row={editTarget}
          jobs={jobs}
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
          row={deleteTarget}
          jobs={jobs}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
