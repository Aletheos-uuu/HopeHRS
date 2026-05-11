import { useState } from "react";
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

function Input({ id, type = "text", value, onChange, placeholder, required }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="
        w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800
        placeholder:text-gray-300 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow
      "
    />
  );
}

function Select({ id, value, onChange, children, required }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className="
        w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
        transition-shadow appearance-none
      "
    >
      {children}
    </select>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

// ─── defaults ─────────────────────────────────────────────────────────────────

const EMPTY = { effdate: "", jobcode: "", deptcode: "", salary: "" };

// ─── form ─────────────────────────────────────────────────────────────────────

export default function AddJobHistoryForm({
  empno,   // BUG FIX: was "empNo" in the parent's prop — prop name is empno (lowercase)
  job,
  depts,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { currentUser } = useAuth();

  // BUG FIX: job and depts are { code → name } objects — Object.entries is correct,
  // but the keys from Supabase are lowercase: jobcode / jobdesc, deptcode / deptname.
  const jobOptions = Object.entries(job);   // [[jobcode, jobdesc], ...]
  const deptOptions = Object.entries(depts); // [[deptcode, deptname], ...]

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
      errs.salary = "Salary must be a number.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError(null);
    try {
      // BUG FIX: All column names must be lowercase to match Supabase schema.
      // Original had camelCase: empno, effDate, jobCode, deptCode — all wrong.
      const payload = {
        empno: empno,
        effdate: form.effdate,
        jobcode: form.jobcode,
        deptcode: form.deptcode,
        salary: form.salary ? Number(form.salary) : null,
        record_status: "ACTIVE",
        stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`,
      };

      const { error } = await supabase.from("jobhistory").insert(payload);
      if (error) throw error;

      setForm(EMPTY);
      onSuccess();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
          New Entry
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      {apiError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Effective Date */}
        <div>
          <Label htmlFor="jh-effdate">Effective Date *</Label>
          <Input
            id="jh-effdate"
            type="date"
            value={form.effdate}
            onChange={(e) => set("effdate", e.target.value)}
            required
          />
          <FieldError message={errors.effdate} />
        </div>

        {/* Job */}
        <div>
          <Label htmlFor="jh-jobcode">Job *</Label>
          <Select
            id="jh-jobcode"
            value={form.jobcode}
            onChange={(e) => set("jobcode", e.target.value)}
            required
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
          <Label htmlFor="jh-deptcode">Department *</Label>
          <Select
            id="jh-deptcode"
            value={form.deptcode}
            onChange={(e) => set("deptcode", e.target.value)}
            required
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

        {/* Salary */}
        <div>
          <Label htmlFor="jh-salary">Salary</Label>
          <Input
            id="jh-salary"
            type="number"
            value={form.salary}
            onChange={(e) => set("salary", e.target.value)}
            placeholder="e.g. 55000"
          />
          <FieldError message={errors.salary} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </div>
  );
}