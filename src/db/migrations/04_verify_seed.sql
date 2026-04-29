SELECT
  table_name,
  row_count,
  expected,
  CASE WHEN row_count = expected THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
  SELECT 'employee'   AS table_name, COUNT(*) AS row_count, 32 AS expected FROM employee
  UNION ALL
  SELECT 'department',               COUNT(*),               8              FROM department
  UNION ALL
  SELECT 'job',                      COUNT(*),               14             FROM job
  UNION ALL
  SELECT 'jobHistory',               COUNT(*),               54             FROM jobHistory
  UNION ALL
  SELECT 'Module',                   COUNT(*),               5              FROM "Module"
  UNION ALL
  SELECT 'rights',                   COUNT(*),               17             FROM rights
) counts
ORDER BY table_name;

SELECT 'jobHistory → employee orphans' AS check_name, COUNT(*) AS orphan_count
FROM jobHistory jh WHERE NOT EXISTS (SELECT 1 FROM employee e WHERE e.empno = jh.empNo)
UNION ALL
SELECT 'jobHistory → job orphans',      COUNT(*)
FROM jobHistory jh WHERE NOT EXISTS (SELECT 1 FROM job j WHERE j.jobCode = jh.jobCode)
UNION ALL
SELECT 'jobHistory → department orphans', COUNT(*)
FROM jobHistory jh WHERE jh.deptCode IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM department d WHERE d.deptCode = jh.deptCode);

SELECT 'employee non-ACTIVE'   AS check_name, COUNT(*) FROM employee   WHERE record_status <> 'ACTIVE'
UNION ALL
SELECT 'department non-ACTIVE',              COUNT(*) FROM department WHERE record_status <> 'ACTIVE'
UNION ALL
SELECT 'job non-ACTIVE',                     COUNT(*) FROM job         WHERE record_status <> 'ACTIVE'
UNION ALL
SELECT 'jobHistory non-ACTIVE',              COUNT(*) FROM jobHistory  WHERE record_status <> 'ACTIVE';
SELECT email, user_type, record_status,
  CASE WHEN user_type = 'SUPERADMIN' AND record_status = 'ACTIVE' THEN 'PASS' ELSE 'FAIL' END AS status
FROM "user" WHERE email = 'jcesperanza@neu.edu.ph';


SELECT 'SUPERADMIN rights' AS check_name,
  COUNT(*) AS granted, 17 AS expected,
  CASE WHEN COUNT(*) = 17 THEN 'PASS' ELSE 'FAIL' END AS status
FROM "UserModule_Rights" umr
JOIN user_module um ON um.user_module_id = umr.user_module_id
WHERE um.userId = 'user1' AND umr.right_value = 1;

SELECT module_code, module_name FROM "Module" ORDER BY module_code;
SELECT rights_code, rights_name, module_code FROM rights ORDER BY module_code, rights_code;

