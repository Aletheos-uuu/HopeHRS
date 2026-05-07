-- 005_rls_employee.sql
-- HopeHRS — RLS Policies: employee

-- RLS — employee

ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;

CREATE POLICY emp_select ON public.employee FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public."user"
    WHERE "userId" = auth.uid()::text
      AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

CREATE POLICY emp_insert ON public.employee FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um."userId" = auth.uid()::text
      AND umr.rights_code = 'EMP_ADD' AND umr.right_value = 1
  )
);

CREATE POLICY emp_update_edit ON public.employee FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um."userId" = auth.uid()::text
      AND umr.rights_code = 'EMP_EDIT' AND umr.right_value = 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um."userId" = auth.uid()::text
      AND umr.rights_code = 'EMP_EDIT' AND umr.right_value = 1
  )
);

CREATE POLICY emp_softdelete ON public.employee FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um."userId" = auth.uid()::text
      AND umr.rights_code = 'EMP_DEL' AND umr.right_value = 1
  )
)
WITH CHECK (
  record_status = 'INACTIVE'
  AND EXISTS (
    SELECT 1 FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um."userId" = auth.uid()::text
      AND umr.rights_code = 'EMP_DEL' AND umr.right_value = 1
  )
);

CREATE POLICY emp_recover ON public.employee FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."user"
    WHERE "userId" = auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN')
  )
)
WITH CHECK (
  record_status = 'ACTIVE'
  AND EXISTS (
    SELECT 1 FROM public."user"
    WHERE "userId" = auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN')
  )
);