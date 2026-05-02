-- HopeHRS - Migration 005: RLS Policies for Employee
-- PR-01  db/rls-employee
-- SELECT + INSERT + UPDATE (edit + deactivate + recover) on employee


-- Enable RLS on employee
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;

-- SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
CREATE POLICY emp_select ON employee
FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

-- INSERT: requires EMP_ADD right = 1
CREATE POLICY emp_insert ON employee
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'EMP_ADD'
    AND umr.right_value = 1
  )
);

-- UPDATE edit fields: requires EMP_EDIT right = 1
CREATE POLICY emp_update_edit ON employee
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'EMP_EDIT'
    AND umr.right_value = 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'EMP_EDIT'
    AND umr.right_value = 1
  )
);

-- UPDATE deactivate (soft delete): requires EMP_DEL right = 1
CREATE POLICY emp_softdelete ON employee
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'EMP_DEL'
    AND umr.right_value = 1
  )
)
WITH CHECK (
  record_status = 'INACTIVE'
  AND EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'EMP_DEL'
    AND umr.right_value = 1
  )
);

-- UPDATE recover: ADMIN or SUPERADMIN only
CREATE POLICY emp_recover ON employee
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
  AND EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

