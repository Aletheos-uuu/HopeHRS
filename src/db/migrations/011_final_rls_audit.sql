-- Section 1 — RLS Enabled Check
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  CASE WHEN rowsecurity THEN 'PASS' ELSE 'FAIL ← RLS OFF' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'employee', 'jobhistory', 'job', 'department',
    'user', 'user_module', 'UserModule_Rights'
  )
ORDER BY tablename;

--Section 2 — Policy Inventory
SELECT
  schemaname,
  tablename,
  policyname,
  cmd AS applies_to,
  roles,
  qual AS using_expr,
  with_check AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'employee', 'jobhistory', 'job', 'department',
    'user', 'user_module', 'UserModule_Rights'
  )
ORDER BY tablename, cmd, policyname;

-- Section 3 — Policy Count Per Table

WITH expected AS (
  SELECT unnest(ARRAY[
    'employee','jobhistory','job','department',
    'user','user_module','UserModule_Rights'
  ]) AS tablename,
  unnest(ARRAY[5, 4, 4, 4, 4, 4, 4]) AS min_policies
),
actual AS (
  SELECT tablename, COUNT(*) AS policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'employee','jobhistory','job','department',
      'user','user_module','UserModule_Rights'
    )
  GROUP BY tablename
)
SELECT
  e.tablename,
  COALESCE(a.policy_count, 0) AS policy_count,
  e.min_policies,
  CASE
    WHEN COALESCE(a.policy_count, 0) >= e.min_policies THEN 'PASS'
    ELSE 'FAIL ← too few policies'
  END AS status
FROM expected e
LEFT JOIN actual a ON a.tablename = e.tablename
ORDER BY e.tablename;

--Section 4a — No Hard-Delete Policy on User Table

SELECT
  tablename,
  policyname,
  cmd,
  'FAIL — DELETE policy found on user table' AS finding
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename  = 'user'
  AND cmd        = 'DELETE'
  AND qual      != 'false';

-- Section 4b — Superadmin Rows Intact

SELECT
  "userId",
  email,
  user_type,
  record_status,
  CASE
    WHEN user_type = 'SUPERADMIN' AND record_status = 'ACTIVE' THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM public."user"
WHERE user_type = 'SUPERADMIN'
ORDER BY email;

-- Section 5 — Hard-Delete Audit

SELECT
  routine_schema,
  routine_name,
  routine_type,
  'Contains DELETE — review required' AS finding
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type   IN ('FUNCTION', 'PROCEDURE')
  AND routine_definition ILIKE '%DELETE FROM%'
  AND routine_definition ~* 'DELETE\s+FROM\s+(public\.)?(employee|jobhistory|job|department|"user"|user_module|"UserModule_Rights")'
ORDER BY routine_name;

-- Section 6 — Trigger Inventory

SELECT
  trigger_schema,
  trigger_name,
  event_object_table AS on_table,
  event_manipulation AS event,
  action_timing      AS timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public','auth')
ORDER BY on_table, trigger_name;


-- Section 7 — View Existence Check

SELECT
  table_name  AS view_name,
  'EXISTS'    AS status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name   IN (
    'employee_current_job',
    'headcount_by_dept',
    'salary_summary_by_job'
  )
ORDER BY table_name;

-- Section 8 — Data Integrity Spot-Check

SELECT 'employee'   AS tbl, COUNT(*) AS total_rows, COUNT(*) FILTER (WHERE record_status='ACTIVE') AS active FROM public.employee
UNION ALL
SELECT 'jobHistory',         COUNT(*),               COUNT(*) FILTER (WHERE record_status='ACTIVE')           FROM public.jobHistory
UNION ALL
SELECT 'job',                COUNT(*),               COUNT(*) FILTER (WHERE record_status='ACTIVE')           FROM public.job
UNION ALL
SELECT 'department',         COUNT(*),               COUNT(*) FILTER (WHERE record_status='ACTIVE')           FROM public.department
UNION ALL
SELECT 'user',               COUNT(*),               COUNT(*) FILTER (WHERE record_status='ACTIVE')           FROM public."user"
ORDER BY tbl;

-- Section 9 — get_my_user_type() Helper Function Check

SELECT
  routine_name,
  security_type,
  is_deterministic,
  CASE
    WHEN security_type = 'DEFINER' THEN 'PASS'
    ELSE 'FAIL — must be SECURITY DEFINER to avoid RLS recursion'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name   = 'get_my_user_type';
