import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import JobHistoryPanel from "../components/jobHistory/JobHistoryPanel";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function getInitials(first, last) {
  return `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

function genderLabel(g) {
  if (!g) return "—";
  return g === "M" ? "Male" : g === "F" ? "Female" : g;
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── profile card ─────────────────────────────────────────────────────────────

function ProfileCard({ employee }) {
  const isActive = employee.record_status === "ACTIVE";
  const initials = getInitials(employee.firstname, employee.lastname);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* top accent bar */}
      <div
        className={`h-1.5 w-full ${
          isActive
            ? "bg-gradient-to-r from-violet-500 to-indigo-500"
            : "bg-gray-200"
        }`}
      />

      <div className="p-6">
        <div className="flex items-start gap-5">
          {/* avatar */}
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
              text-lg font-semibold tracking-tight
              ${
                isActive
                  ? "bg-gradient-to-br from-violet-100 to-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-400"
              }
            `}
          >
            {initials}
          </div>

          {/* name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                {employee.firstname} {employee.lastname}
              </h1>
              <span
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {employee.record_status ?? "ACTIVE"}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-0.5 font-mono">
              #{employee.empno}
            </p>

            {employee.jobdesc && (
              <p className="mt-1.5 text-sm font-medium text-indigo-600">
                {employee.jobdesc}
                {employee.deptname && (
                  <span className="text-gray-400 font-normal">
                    {" "}— {employee.deptname}
                  </span>
                )}
              </p>
            )}

            {/* detail grid */}
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Gender
                </dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {genderLabel(employee.gender)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Hire Date
                </dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {formatDate(employee.hiredate)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {employee.sepdate ? "Separation Date" : "Status"}
                </dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  {employee.sepdate ? (
                    <span className="text-orange-600">
                      {formatDate(employee.sepdate)}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Currently employed
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmployee() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("employee_current_job")
          .select("*")
          .eq("empno", empno)
          .maybeSingle();

        if (error) throw error;
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (empno) fetchEmployee();
  }, [empno]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* back nav */}
        <button
          onClick={() => navigate("/employees")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 12L6 8l4-4"
            />
          </svg>
          Back to Employees
        </button>

        {/* content */}
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
            Failed to load employee: {error}
          </div>
        ) : employee ? (
          <>
            <ProfileCard employee={employee} />
            <JobHistoryPanel empno={employee.empno} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">Employee not found.</p>
          </div>
        )}

      </div>
    </div>
  );
}