import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth, usePermission } from "../context/AuthContext";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import SoftDeleteConfirmDialog from "../components/employees/SoftDeleteConfirmDialog";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

// ─── icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
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

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l4 4-4 4" />
    </svg>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

function TableSkeleton({ cols }) {
  return (
    <div className="animate-pulse divide-y divide-gray-50">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="px-4 py-3.5 flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-3.5 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const canAdd = usePermission("EMP_ADD");
  const canEdit = usePermission("EMP_EDIT");
  const canDel = usePermission("EMP_DEL");

  const isUser = currentUser?.user_type === "USER";
  const showStamp = !isUser;
  const canSeeInactive = !isUser;

  // ── local data fetch ───────────────────────────────────────────────────────
  // Fetch from employee_current_job view so jobdesc + deptname are available.
  // For USER accounts we filter ACTIVE only; ADMIN/SUPERADMIN get all rows.
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("employee_current_job")
        .select("*")
        .order("empno");

      // USER accounts: RLS already filters, but be explicit too
      if (isUser) query = query.eq("record_status", "ACTIVE");

      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── ui state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      // hide inactive unless toggled on (ADMIN/SUPERADMIN only)
      if (!showInactive && emp.record_status === "INACTIVE") return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          emp.empno?.toLowerCase().includes(q) ||
          emp.lastname?.toLowerCase().includes(q) ||
          emp.firstname?.toLowerCase().includes(q) ||
          emp.jobdesc?.toLowerCase().includes(q) ||
          emp.deptname?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, search, showInactive]);

  // ── stats ──────────────────────────────────────────────────────────────────
  const totalActive = employees.filter(
    (e) => e.record_status === "ACTIVE",
  ).length;
  const totalInactive = employees.filter(
    (e) => e.record_status === "INACTIVE",
  ).length;

  const colCount = 8 + (showStamp ? 1 : 0) + (canEdit || canDel ? 1 : 0);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Employees
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              View, add, edit, and soft-delete employee records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:flex-wrap">
            {/* search */}
            <input
              type="text"
              placeholder="Search by name, emp no, job…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
            />

            {/* show inactive toggle — ADMIN/SUPERADMIN only */}
            {canSeeInactive && (
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="accent-violet-600"
                />
                Show inactive
              </label>
            )}

            {/* add button — EMP_ADD right */}
            {canAdd && (
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <PlusIcon />
                Add employee
              </button>
            )}
          </div>
        </div>

        {/* stat cards — show 4 fixed-width columns and allow horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <div className="flex gap-3 py-1 w-max">
            {[
              { label: "Total", value: employees.length },
              { label: "Active", value: totalActive },
              { label: "Inactive", value: totalInactive },
              { label: "Showing", value: filtered.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex-shrink-0 min-w-[180px] bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3"
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton cols={colCount} />
          ) : error ? (
            <div className="px-6 py-8 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-400">
                {search
                  ? "No employees match your search."
                  : "No employees found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      { label: "Emp No", cls: "" },
                      { label: "Last Name", cls: "" },
                      { label: "First Name", cls: "hidden sm:table-cell" },
                      { label: "Gender", cls: "hidden md:table-cell" },
                      { label: "Hire Date", cls: "hidden lg:table-cell" },
                      { label: "Sep Date", cls: "hidden lg:table-cell" },
                      { label: "Current Job", cls: "hidden md:table-cell" },
                      { label: "Status", cls: "" },
                      ...(showStamp
                        ? [{ label: "Stamp", cls: "hidden xl:table-cell" }]
                        : []),
                      ...(canEdit || canDel
                        ? [{ label: "", cls: "" }]
                        : []),
                    ].map(({ label, cls }, i) => (
                      <th
                        key={label + i}
                        className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 ${cls}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((emp) => {
                    const isInactive = emp.record_status === "INACTIVE";
                    return (
                      <tr
                        key={emp.empno}
                        onClick={() => navigate(`/employees/${emp.empno}`)}
                        className={`cursor-pointer transition-colors group ${
                          isInactive
                            ? "opacity-50 hover:bg-gray-50/50"
                            : "hover:bg-violet-50/40"
                        }`}
                      >
                        {/* emp no */}
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {emp.empno}
                        </td>

                        {/* last name */}
                        <td className="px-4 py-3.5 font-medium text-gray-900">
                          {emp.lastname}
                        </td>

                        {/* first name */}
                        <td className="hidden sm:table-cell px-4 py-3.5 text-gray-700">
                          {emp.firstname}
                        </td>

                        {/* gender */}
                        <td className="hidden md:table-cell px-4 py-3.5 text-gray-500">
                          {emp.gender === "M"
                            ? "Male"
                            : emp.gender === "F"
                              ? "Female"
                              : "—"}
                        </td>

                        {/* hire date */}
                        <td className="hidden lg:table-cell px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {formatDate(emp.hiredate)}
                        </td>

                        {/* sep date */}
                        <td className="hidden lg:table-cell px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {emp.sepdate ? (
                            <span className="text-orange-600">
                              {formatDate(emp.sepdate)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* current job — from employee_current_job view */}
                        <td className="hidden md:table-cell px-4 py-3.5">
                          {emp.jobdesc ? (
                            <span>
                              <span className="text-gray-800 font-medium">
                                {emp.jobdesc}
                              </span>
                              {emp.deptname && (
                                <span className="text-gray-400 text-xs ml-1.5">
                                  — {emp.deptname}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* status badge */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={emp.record_status} />
                        </td>

                        {/* stamp — ADMIN/SUPERADMIN only */}
                        {showStamp && (
                          <td className="hidden xl:table-cell px-4 py-3.5 max-w-[160px]">
                            {emp.stamp ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 truncate max-w-full">
                                {emp.stamp}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        )}

                        {/* actions — EMP_EDIT / EMP_DEL gated */}
                        {(canEdit || canDel) && (
                          <td
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()} // don't navigate when clicking actions
                          >
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {canEdit && (
                                <button
                                  onClick={() => setEditTarget(emp)}
                                  title="Edit employee"
                                  className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                  <EditIcon />
                                </button>
                              )}
                              {canDel && emp.record_status === "ACTIVE" && (
                                <button
                                  onClick={() => setDeleteTarget(emp)}
                                  title="Soft-delete employee"
                                  className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <TrashIcon />
                                </button>
                              )}
                              <span className="text-gray-200 group-hover:text-gray-300 transition-colors">
                                <ChevronRightIcon />
                              </span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-300">
          {filtered.length} of {employees.length} records shown
        </p>
      </div>

      {/* modals */}
      {canAdd && (
        <AddEmployeeModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            fetchEmployees();
          }}
          currentUser={currentUser}
        />
      )}
      {canEdit && editTarget && (
        <EditEmployeeModal
          open={!!editTarget}
          employee={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            fetchEmployees();
          }}
          currentUser={currentUser}
        />
      )}
      {canDel && deleteTarget && (
        <SoftDeleteConfirmDialog
          open={!!deleteTarget}
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            setDeleteTarget(null);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
}
