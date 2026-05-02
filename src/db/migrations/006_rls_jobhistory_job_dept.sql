-- HopeHRS - Migration 006: RLS Policies for jobHistory, job, department
-- PR-02 Sprint 2 db/rls-jobhistory-job-dept
-- Same 4-policy pattern applied to jobHistory, job, and department

-- Enable RLS
ALTER TABLE jobHistory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE job         ENABLE ROW LEVEL SECURITY;
ALTER TABLE department  ENABLE ROW LEVEL SECURITY;

-- JOBHISTORY POLICIES

CREATE POLICY jh_select ON jobHistory
FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

CREATE POLICY jh_insert ON jobHistory
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JH_ADD'
    AND umr.right_value = 1
  )
);

CREATE POLICY jh_update_edit ON jobHistory
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JH_EDIT'
    AND umr.right_value = 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JH_EDIT'
    AND umr.right_value = 1
  )
);

CREATE POLICY jh_softdelete ON jobHistory
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JH_DEL'
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
    AND umr.rights_code = 'JH_DEL'
    AND umr.right_value = 1
  )
);

CREATE POLICY jh_recover ON jobHistory
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

-- JOB POLICIES


CREATE POLICY job_select ON job
FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

CREATE POLICY job_insert ON job
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JOB_ADD'
    AND umr.right_value = 1
  )
);

CREATE POLICY job_update_edit ON job
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JOB_EDIT'
    AND umr.right_value = 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JOB_EDIT'
    AND umr.right_value = 1
  )
);

CREATE POLICY job_softdelete ON job
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'JOB_DEL'
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
    AND umr.rights_code = 'JOB_DEL'
    AND umr.right_value = 1
  )
);

CREATE POLICY job_recover ON job
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

-- DEPARTMENT POLICIES


CREATE POLICY dept_select ON department
FOR SELECT TO authenticated
USING (
  record_status = 'ACTIVE'
  OR EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = auth.uid()::text
    AND user_type IN ('ADMIN','SUPERADMIN')
  )
);

CREATE POLICY dept_insert ON department
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'DEPT_ADD'
    AND umr.right_value = 1
  )
);

CREATE POLICY dept_update_edit ON department
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'DEPT_EDIT'
    AND umr.right_value = 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'DEPT_EDIT'
    AND umr.right_value = 1
  )
);

CREATE POLICY dept_softdelete ON department
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public."UserModule_Rights" umr
    JOIN public.user_module um ON um.user_module_id = umr.user_module_id
    WHERE um.userId = auth.uid()::text
    AND umr.rights_code = 'DEPT_DEL'
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
    AND umr.rights_code = 'DEPT_DEL'
    AND umr.right_value = 1
  )
);

CREATE POLICY dept_recover ON department
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

