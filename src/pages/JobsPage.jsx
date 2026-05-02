import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import AddJobModal from "../components/jobs/AddJobModal";
import EditJobModal from "../components/jobs/EditJobModal";

// ─── helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

function IconButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474L5.81 13.75a.75.75 0 0 1-.374.206l-3.5.875a.75.75 0 0 1-.911-.912l.875-3.5a.75.75 0 0 1 .206-.373L11.013 1.427ZM12.72 2.488a.25.25 0 0 0-.353 0L3.496 11.359l-.57 2.283 2.283-.571 8.87-8.871a.25.25 0 0 0 0-.353L12.72 2.488Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
    </svg>
  );
}

// ─── 403 inline component ────────────────────────────────────────────────────

function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-red-500"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Access Restricted
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        You don't have permission to view this page. Contact your administrator
        if you think this is a mistake.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { userRole } = useAuth();
  const canAdd = usePermission("JOB_ADD");
  const canEdit = usePermission("JOB_EDIT");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);

  // ── Page-level ADMIN+ guard ────────────────────────────────────────────
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
  if (!isAdmin) return <Forbidden />;

  // ── Data fetch ────────────────────────────────────────────────────────
  async function fetchJobs() {
    setLoading(true);
    const { data, error } = await supabase

      .from("job")
      .select("jobCode, jobDesc, record_status")
      .order("jobCode", { ascending: true });


    if (!error) setJobs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  // ── Derived list ─────────────────────────────────────────────────────
  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.jobCode.toLowerCase().includes(q) ||
      j.jobDesc.toLowerCase().includes(q)

    );
  });

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 w-48"
            />
          </div>

          {/* Add button */}
          {canAdd && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <PlusIcon />
              Add Job
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-36">
                  Job Code
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Description
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-28">
                  Status
                </th>
                {canEdit && (
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={canEdit ? 4 : 3}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 4 : 3}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    {search ? "No jobs match your search." : "No jobs found."}
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr

                    key={job.jobCode}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium tracking-wide">
                      {job.jobCode}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{job.jobDesc}</td>

                    <td className="px-4 py-3">
                      <StatusBadge status={job.record_status} />
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <IconButton
                          onClick={() => setEditJob(job)}
                          title="Edit job"
                        >
                          <EditIcon />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddJobModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchJobs}
      />
      <EditJobModal
        open={!!editJob}
        onClose={() => setEditJob(null)}
        onSuccess={() => {
          setEditJob(null);
          fetchJobs();
        }}
        job={editJob}
      />
    </div>
  );
}
