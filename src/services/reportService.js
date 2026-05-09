// HR Reports API – Sprint 3, M1 PR-02
import { supabase } from '../lib/supabaseClient'

/**
 * Fetch active headcount per department.
 * Reads from the headcount_by_dept view created by M3.
 * Returns rows ordered by active_employee_count descending.
 *
 * @returns {Promise<Array>} [{ deptCode, deptName, active_employee_count }]
 */
export async function getHeadcountByDept() {
  const { data, error } = await supabase
    .from('headcount_by_dept')
    .select('deptCode, deptName, active_employee_count')
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
 * @returns {Promise<Array>} [{ jobCode, jobDesc, employee_count, min_salary, max_salary, avg_salary }]
 */
export async function getSalarySummaryByJob() {
  const { data, error } = await supabase
    .from('salary_summary_by_job')
    .select('jobCode, jobDesc, employee_count, min_salary, max_salary, avg_salary')
    .order('avg_salary', { ascending: false })

  if (error) {
    console.error('[reportService] getSalarySummaryByJob error:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Fetch the complete chronological job history for a single employee.
 * Joins jobHistory → job (for jobDesc) → department (for deptName).
 * Returns only ACTIVE jobHistory rows, sorted by effDate ascending.
 *
 * @param {string} empNo - The employee number (e.g. '00001').
 * @returns {Promise<Array>} [{ empNo, jobCode, jobDesc, deptCode, deptName, salary, effDate, stamp }]
 */
export async function getEmployeeFullHistory(empNo) {
  if (!empNo) return []

  const { data, error } = await supabase
    .from('jobHistory')
    .select(`
      empNo,
      jobCode,
      job ( jobDesc ),
      deptCode,
      department ( deptName ),
      salary,
      effDate,
      stamp,
      record_status
    `)
    .eq('empNo', empNo)
    .eq('record_status', 'ACTIVE')
    .order('effDate', { ascending: true })

  if (error) {
    console.error('[reportService] getEmployeeFullHistory error:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    empNo:         row.empNo,
    jobCode:       row.jobCode,
    jobDesc:       row.job?.jobDesc ?? '',
    deptCode:      row.deptCode,
    deptName:      row.department?.deptName ?? '',
    salary:        row.salary,
    effDate:       row.effDate,
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