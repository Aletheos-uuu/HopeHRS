-- HopeHRS - Migration 008: employee_current_job View
-- PR-04  db/view-employee-current-job
-- Latest active jobHistory per employee joined with job and department
 
DROP VIEW IF EXISTS employee_current_job;
 
CREATE VIEW employee_current_job AS
SELECT
  e.empno,
  e.lastname,
  e.firstname,
  e.gender,
  e.hiredate,
  e.sepDate,
  jh.jobCode,
  j.jobDesc,
  jh.salary,
  jh.deptCode,
  d.deptName,
  jh.effDate AS currentEffDate
FROM employee e
JOIN jobHistory jh ON jh.empNo = e.empno
JOIN job        j  ON j.jobCode  = jh.jobCode
JOIN department d  ON d.deptCode = jh.deptCode
WHERE jh.effDate = (
  SELECT MAX(effDate)
  FROM jobHistory
  WHERE empNo = e.empno
  AND record_status = 'ACTIVE'
)
AND e.record_status  = 'ACTIVE'
AND jh.record_status = 'ACTIVE';