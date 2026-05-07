-- 004_verify_seed.sql
-- HopeHRS — Verification Queries

-- VERIFICATION QUERIES

SELECT 'employee'   AS tbl, COUNT(*) AS rows, 32 AS expected, CASE WHEN COUNT(*)=32  THEN 'PASS' ELSE 'FAIL' END AS status FROM public.employee
UNION ALL
SELECT 'department',         COUNT(*),         8,              CASE WHEN COUNT(*)=8   THEN 'PASS' ELSE 'FAIL' END FROM public.department
UNION ALL
SELECT 'job',                COUNT(*),         14,             CASE WHEN COUNT(*)=14  THEN 'PASS' ELSE 'FAIL' END FROM public.job
UNION ALL
SELECT 'jobHistory',         COUNT(*),         54,             CASE WHEN COUNT(*)=54  THEN 'PASS' ELSE 'FAIL' END FROM public.jobHistory
UNION ALL
SELECT 'Module',             COUNT(*),         5,              CASE WHEN COUNT(*)=5   THEN 'PASS' ELSE 'FAIL' END FROM public."Module"
UNION ALL
SELECT 'rights',             COUNT(*),         17,             CASE WHEN COUNT(*)=17  THEN 'PASS' ELSE 'FAIL' END FROM public.rights
UNION ALL
SELECT 'superadmins',        COUNT(*),         2,              CASE WHEN COUNT(*)=2   THEN 'PASS' ELSE 'FAIL' END FROM public."user" WHERE user_type='SUPERAD