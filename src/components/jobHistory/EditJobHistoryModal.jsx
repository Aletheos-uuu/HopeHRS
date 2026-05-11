import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

// ─── field components ─────────────────────────────────────────────────────────

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-gray-600 mb-1"
    >
      {children}
    </label>
  );
}

function Input({ id, type = "text", value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full px-3 py-2 rounded-lg border text-sm text-gray-800
        placeholder:text-gray-300 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow
        ${disabled ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" : "border-gray-200"}
      `}
    />
  );
}

function Select({ id, value, onChange, children, disabled }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2 rounded-lg border text-sm text-gray-800 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow appearance-none
        ${disabled ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" : "border-gray-200"}
      `}
    >
      {children}
    </select>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

// ─── modal ────────────────────────────────────────────────────────────────────

export default function EditJobHistoryModal({
  row,
  // BUG FIX: prop was named "job" in this component but parent was passing it as "jobs"
  // (undefined). Standardized to "jobs" here and fixed the parent call site too.
  jobs,
  depts,
  onSuccess,
  onClose,
}) {
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    effdate: "",
    jobcode: "",
    deptcode: "",
    salary: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  // BUG FIX: Object.entries on jobs/depts — keys from Supabase are lowercase.
  const jobOptions = Object.entries(jobs ?? {});
  const deptOptions = Object.entries(depts ?? {});

  // seed from row — BUG FIX: use lowercase column names from Supabase response
  useEffect(() => {
    if (row) {
      setForm({
        effdate: row.effdate ?? "",   // was row.effDate
        jobcode: row.jobcode ?? "",   // was row.jobCode
        deptcode: row.deptcode ?? "", // was row.deptCode
        salary: row.salary != null ? String(row.salary) : "",
      });
      setErrors({});
      setApiError(null);
    }
  }, [row]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.effdate) errs.effdate = "Effective date is required.";
    if (!form.jobcode) errs.jobcode = "Job is required.";
    if (!form.deptcode) errs.deptcode = "Department is required.";
    if (form.salary && isNaN(Number(form.salary)))
      errs.salary = "Must be a number.";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError(null);
    try {
      // BUG FIX: composite PK comparison and payload keys must all be lowercase
      const pkChanged =
        form.effdate !== row.effdate || form.jobcode !== row.jobcode;

      const payload = {
        empno: row.empno,
        effdate: form.effdate,
        jobcode: form.jobcode,
        deptcode: form.deptcode,
        salary: form.salary ? Number(form.salary) : null,
        record_status: "ACTIVE",
        stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`,
      };

      if (pkChanged) {
        // Composite PK changed: soft-delete old row, insert new one
        const { error: delErr } = await supabase
          .from("jobhistory")
          .update({ record_status: "INACTIVE" })
          .eq("empno", row.empno)
          .eq("jobcode", row.jobcode)   // BUG FIX: was "jobCode"
          .eq("effdate", row.effdate);  // BUG FIX: was "effDate"
        if (delErr) throw delErr;

        const { error: insErr } = await supabase
          .from("jobhistory")
          .insert(payload);
        if (insErr) throw insErr;
      } else {
        const { error } = await supabase
          .from("jobhistory")
          .update(payload)
          .eq("empno", row.empno)
          .eq("jobcode", row.jobcode)   // BUG FIX: was "jobCode"
          .eq("effdate", row.effdate);  // BUG FIX: was "effDate"
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={saving ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Edit Job History Entry
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Employee #{row?.empno}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 3.5l9 9M12.5 3.5l-9 9"
              />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Effective Date */}
            <div>
              <Label htmlFor="edit-effdate">Effective Date *</Label>
              <Input
                id="edit-effdate"
                type="date"
                value={form.effdate}
                onChange={(e) => set("effdate", e.target.value)}
              />
              <FieldError message={errors.effdate} />
            </div>

            {/* Salary */}
            <div>
              <Label htmlFor="edit-salary">Salary</Label>
              <Input
                id="edit-salary"
                type="number"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="e.g. 60000"
              />
              <FieldError message={errors.salary} />
            </div>

            {/* Job */}
            <div>
              <Label htmlFor="edit-jobcode">Job *</Label>
              <Select
                id="edit-jobcode"
                value={form.jobcode}
                onChange={(e) => set("jobcode", e.target.value)}
              >
                <option value="">Select job…</option>
                {jobOptions.map(([code, desc]) => (
                  <option key={code} value={code}>
                    {desc}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.jobcode} />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="edit-deptcode">Department *</Label>
              <Select
                id="edit-deptcode"
                value={form.deptcode}
                onChange={(e) => set("deptcode", e.target.value)}
              >
                <option value="">Select department…</option>
                {deptOptions.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.deptcode} />
            </div>
          </div>

          {/* read-only stamp */}
          {row?.stamp && (
            <div>
              <Label>Stamp</Label>
              <div className="px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs font-mono text-gray-400">
                {row.stamp}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}