import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import AddJobModal from "../components/jobs/AddJobModal";
import EditJobModal from "../components/jobs/EditJobModal";

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

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
    </svg>
  );
}

function DeleteConfirm({ job, onConfirm, onCancel, deleting }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
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
          <p className="text-sm font-semibold text-gray-900">Remove job?</p>
          {/* ✅ was job?.jobDesc */}
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{job?.jobdesc}</span>
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

export default function JobsPage() {
  const { userRole, currentUser } = useAuth();
  const canAdd = usePermission("JOB_ADD");
  const canEdit = usePermission("JOB_EDIT");
  const canDel = usePermission("JOB_DEL");

  const showStamp = currentUser?.user_type !== "USER";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchJobs() {
    setLoading(true);
    let query = supabase
      .from("job")
      .select("jobcode, jobdesc, record_status, stamp")
      .order("jobcode", { ascending: true });

    if (currentUser?.user_type === "USER") {
      query = query.eq("record_status", "ACTIVE");
    }

    const { data, error } = await query;
    if (!error) setJobs(data ?? []);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteJob) return;
    setDeleting(true);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("job")
      .update({
        record_status: "INACTIVE",
        stamp: `DEL by ${currentUser.email} on ${today}`.slice(0, 60), // ✅ add stamp
      })
      .eq("jobcode", deleteJob.jobcode);
    if (error) console.error("Delete failed:", error);
    setDeleting(false);
    setDeleteJob(null);
    if (!error) fetchJobs();
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    // ✅ was j.jobCode + j.jobDesc
    return (
      j.jobcode.toLowerCase().includes(q) || j.jobdesc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
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
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 w-full sm:w-48"
            />
          </div>

          {canAdd && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap"
            >
              <PlusIcon />
              Add Job
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-28 sm:w-36">
                  Job Code
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Description
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-24 sm:w-28">
                  Status
                </th>
                {showStamp && (
                  <th className="hidden lg:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-32">
                    Stamp
                  </th>
                )}
                {(canEdit || canDel) && (
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      canEdit || canDel
                        ? showStamp
                          ? 5
                          : 4
                        : showStamp
                          ? 4
                          : 3
                    }
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      canEdit || canDel
                        ? showStamp
                          ? 5
                          : 4
                        : showStamp
                          ? 4
                          : 3
                    }
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    {search ? "No jobs match your search." : "No jobs found."}
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  // ✅ was key={job.jobCode}
                  <tr
                    key={job.jobcode}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* ✅ was job.jobCode */}
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium tracking-wide">
                      {job.jobcode}
                    </td>
                    {/* ✅ was job.jobDesc */}
                    <td className="px-4 py-3 text-gray-800">{job.jobdesc}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.record_status} />
                    </td>
                    {showStamp && (
                      <td className="hidden lg:table-cell px-4 py-3 text-gray-500 text-xs">
                        {job.stamp ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                            {job.stamp}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    )}
                    {(canEdit || canDel) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {canEdit && (
                            <IconButton
                              onClick={() => setEditJob(job)}
                              title="Edit job"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {canDel && (
                            <IconButton
                              onClick={() => setDeleteJob(job)}
                              title="Delete job"
                            >
                              <TrashIcon />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddJobModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchJobs}
        currentUser={currentUser}
      />
      <EditJobModal
        open={!!editJob}
        onClose={() => setEditJob(null)}
        onSuccess={() => {
          setEditJob(null);
          fetchJobs();
        }}
        job={editJob}
        currentUser={currentUser}
      />
      {deleteJob && (
        <DeleteConfirm
          job={deleteJob}
          onConfirm={handleDelete}
          onCancel={() => setDeleteJob(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
