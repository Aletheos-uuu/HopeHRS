-- 009_views_reports.sql
-- HopeHRS — HR Report Views (Sprint 3, PR-01)

-- VIEW 1: headcount_by_dept
-- Active employee count per department.
-- Logic: one row per employee = their LATEST active jobHistory row.
-- Only employees whose own record_status = 'ACTIVE' are counted.

CREATE OR REPLACE VIEW public.headcount_by_dept AS
SELECT
  d.deptCode,
  d.deptName,
  COUNT(DISTINCT latest_jh.empNo) AS active_employee_count
FROM public.department d
LEFT JOIN (
  -- One row per employee: their single latest active jobHistory row
  SELECT jh.empNo, jh.deptCode
  FROM public.jobHistory jh
  JOIN public.employee e ON e.empno = jh.empNo
  WHERE jh.record_status = 'ACTIVE'
    AND e.record_status  = 'ACTIVE'
    AND jh.effDate = (
      SELECT MAX(jh2.effDate)
      FROM public.jobHistory jh2
      WHERE jh2.empNo        = jh.empNo
        AND jh2.record_status = 'ACTIVE'
    )
) AS latest_jh ON latest_jh.deptCode = d.deptCode
WHERE d.record_status = 'ACTIVE'
GROUP BY d.deptCode, d.deptName
ORDER BY active_employee_count DESC, d.deptName;


-- VIEW 2: salary_summary_by_job
-- MIN, MAX, AVG salary per active job, using only active jobHistory rows.


CREATE OR REPLACE VIEW public.salary_summary_by_job AS
SELECT
  j.jobCode,
  j.jobDesc,
  COUNT(jh.empNo)                      AS employee_count,
  MIN(jh.salary)                       AS min_salary,
  MAX(jh.salary)                       AS max_salary,
  ROUND(AVG(jh.salary), 2)             AS avg_salary
FROM public.job j
LEFT JOIN public.jobHistory jh
       ON jh.jobCode       = j.jobCode
      AND jh.record_status = 'ACTIVE'
WHERE j.record_status = 'ACTIVE'
GROUP BY j.jobCode, j.jobDesc
ORDER BY avg_salary DESC NULLS LAST, j.jobCode;
