-- 006_rls_jobhistory_job_dept.sql
-- HopeHRS — RLS Policies: jobHistory, job, department

-- STEP 8: RLS — jobHistory, job, department


ALTER TABLE public.jobHistory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department  ENABLE ROW LEVEL SECURITY;

-- JOB HISTORY
CREATE POLICY jh_select ON public.jobHistory FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);

CREATE POLICY jh_insert ON public.jobHistory FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JH_ADD' AND umr.right_value=1)
);

CREATE POLICY jh_update_edit ON public.jobHistory FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JH_EDIT' AND umr.right_value=1)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JH_EDIT' AND umr.right_value=1)
);

CREATE POLICY jh_softdelete ON public.jobHistory FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JH_DEL' AND umr.right_value=1)
)
WITH CHECK (
  record_status='INACTIVE'
  AND EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JH_DEL' AND umr.right_value=1)
);

CREATE POLICY jh_recover ON public.jobHistory FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
)
WITH CHECK (
  record_status='ACTIVE'
  AND EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);

-- JOB
CREATE POLICY job_select ON public.job FOR SELECT TO authenticated
USING (
  record_status='ACTIVE'
  OR EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);

CREATE POLICY job_insert ON public.job FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JOB_ADD' AND umr.right_value=1)
);

CREATE POLICY job_update_edit ON public.job FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JOB_EDIT' AND umr.right_value=1)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JOB_EDIT' AND umr.right_value=1)
);

CREATE POLICY job_softdelete ON public.job FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JOB_DEL' AND umr.right_value=1)
)
WITH CHECK (
  record_status='INACTIVE'
  AND EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='JOB_DEL' AND umr.right_value=1)
);

CREATE POLICY job_recover ON public.job FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
)
WITH CHECK (
  record_status='ACTIVE'
  AND EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);

-- DEPARTMENT
CREATE POLICY dept_select ON public.department FOR SELECT TO authenticated
USING (
  record_status='ACTIVE'
  OR EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);

CREATE POLICY dept_insert ON public.department FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='DEPT_ADD' AND umr.right_value=1)
);

CREATE POLICY dept_update_edit ON public.department FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='DEPT_EDIT' AND umr.right_value=1)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='DEPT_EDIT' AND umr.right_value=1)
);

CREATE POLICY dept_softdelete ON public.department FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='DEPT_DEL' AND umr.right_value=1)
)
WITH CHECK (
  record_status='INACTIVE'
  AND EXISTS (SELECT 1 FROM public."UserModule_Rights" umr JOIN public.user_module um ON um.user_module_id=umr.user_module_id WHERE um."userId"=auth.uid()::text AND umr.rights_code='DEPT_DEL' AND umr.right_value=1)
);

CREATE POLICY dept_recover ON public.department FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
)
WITH CHECK (
  record_status='ACTIVE'
  AND EXISTS (SELECT 1 FROM public."user" WHERE "userId"=auth.uid()::text AND user_type IN ('ADMIN','SUPERADMIN'))
);