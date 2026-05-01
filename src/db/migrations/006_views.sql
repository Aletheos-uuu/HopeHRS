-- HopeHRS - Migration 006: SQL Views
-- PR-06  db/views

CREATE OR REPLACE VIEW employee_current_job AS
SELECT
  e.empno,
  e.lastname,
  e.firstname,
  e.gender,
  e.hiredate,
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
AND e.record_status   = 'ACTIVE'
AND jh.record_status  = 'ACTIVE';