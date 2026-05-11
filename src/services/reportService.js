// HR Reports API – Sprint 3, M1 PR-02
import { supabase } from '../lib/supabaseClient'

/**
 * Fetch active headcount per department.
 * Reads from the headcount_by_dept view created by M3.
 * Returns rows ordered by active_employee_count descending.
 *
 * @returns {Promise<Array>} [{ deptcode, deptname, active_employee_count }]
 */
export async function getHeadcountByDept() {
  const { data, error } = await supabase
    .from('headcount_by_dept')
    .select('deptcode, deptname, active_employee_count')
    .order('active_employee_count', { ascending: false })

  if (error) {
    console.error('[reportService] getHeadcountByDept error:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Fetch salary summary (min / max / avg) per active job code.
 * Reads from the salary_summary_by_job view created by M3.
 * Returns rows ordered by avg_salary descending.
 *
 * @returns {Promise<Array>} [{ jobcode, jobdesc, employee_count, min_salary, max_salary, avg_salary }]
 */
export async function getSalarySummaryByJob() {
  const { data, error } = await supabase
    .from('salary_summary_by_job')
    .select('jobcode, jobdesc, employee_count, min_salary, max_salary, avg_salary')
    .order('avg_salary', { ascending: false })

  if (error) {
    console.error('[reportService] getSalarySummaryByJob error:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Fetch the complete chronological job history for a single employee.
 * Joins jobhistory → job (for jobdesc) → department (for deptname).
 * Returns only ACTIVE jobhistory rows, sorted by effdate ascending.
 *
 * @param {string} empNo - The employee number (e.g. '00001').
 * @returns {Promise<Array>} [{ empno, jobcode, jobdesc, deptcode, deptname, salary, effdate, stamp }]
 */
export async function getEmployeeFullHistory(empNo) {
  if (!empNo) return []

  const { data, error } = await supabase
    .from('jobhistory')
    .select(`
      empno,
      jobcode,
      job ( jobdesc ),
      deptcode,
      department ( deptname ),
      salary,
      effdate,
      stamp,
      record_status
    `)
    .eq('empno', empNo)
    .eq('record_status', 'ACTIVE')
    .order('effdate', { ascending: true })

  if (error) {
    console.error('[reportService] getEmployeeFullHistory error:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    empno:         row.empno,
    jobcode:       row.jobcode,
    jobdesc:       row.job?.jobdesc ?? '',
    deptcode:      row.deptcode,
    deptname:      row.department?.deptname ?? '',
    salary:        row.salary,
    effdate:       row.effdate,
    stamp:         row.stamp,
    record_status: row.record_status,
  }))
}

/**
 * Fetch all ACTIVE employees for the EmployeeSelector dropdown.
 * Returns empNo + full name only — lightweight call.
 *
 * @returns {Promise<Array>} [{ empNo, lastname, firstname }]
 */
export async function getActiveEmployees() {
  const { data, error } = await supabase
    .from('employee')
    .select('empno, lastname, firstname')
    .eq('record_status', 'ACTIVE')
    .order('lastname', { ascending: true })

  if (error) {
    console.error('[reportService] getActiveEmployees error:', error.message)
    return []
  }
  return data ?? []
}