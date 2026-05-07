-- 008_view_employee_current_job.sql
-- HopeHRS — employee_current_job View

-- STEP 10: employee_current_job VIEW
-- Latest active jobHistory per employee + job + dept names

CREATE VIEW public.employee_current_job AS
SELECT
  e.empno,
  e.lastname,
  e.firstname,
  e.gender,
  e.birthdate,
  e.hiredate,
  e.sepDate,
  e.record_status,
  e.stamp,
  jh.jobCode,
  j.jobDesc,
  jh.salary,
  jh.deptCode,
  d.deptName,
  jh.effDate AS currentEffDate
FROM public.employee e
JOIN public.jobHistory jh ON jh.empNo = e.empno
JOIN public.job         j  ON j.jobCode  = jh.jobCode
JOIN public.department  d  ON d.deptCode = jh.deptCode
WHERE jh.effDate = (
  SELECT MAX(effDate)
  FROM public.jobHistory
  WHERE empNo = e.empno
    AND record_status = 'ACTIVE'
)
AND e.record_status  = 'ACTIVE'
AND jh.record_status = 'ACTIVE';