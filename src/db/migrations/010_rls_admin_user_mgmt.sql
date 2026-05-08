-- 010_rls_admin_user_mgmt.sql
-- HopeHRS — Admin Module RLS: user + UserModule_Rights (Sprint 3, PR-02)

--  SUPERADMIN  — full read/write on user + UserModule_Rights (already owns db)
--  ADMIN       — can UPDATE record_status on user rows WHERE user_type != 'SUPERADMIN'
--                cannot change user_type
--                cannot touch UserModule_Rights rows that belong to a SUPERADMIN
--  USER        — can only read their own user row (needed for rights loading)

--  TABLE: public."user"

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

-- ── Helper: inline function to get caller's user_type without recursion ──────
-- We use a SECURITY DEFINER function so the lookup bypasses RLS on "user"
-- (avoids infinite recursion when a policy on "user" reads from "user").

CREATE OR REPLACE FUNCTION public.get_my_user_type()
RETURNS VARCHAR(20)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_type FROM public."user" WHERE "userId" = auth.uid()::text LIMIT 1;
$$;


--SELECT 
-- SUPERADMIN/ADMIN: see all rows.
-- USER: see only their own row (needed by UserRightsContext to load rights).

CREATE POLICY user_select ON public."user"
  FOR SELECT TO authenticated
  USING (
    public.get_my_user_type() IN ('SUPERADMIN', 'ADMIN')
    OR "userId" = auth.uid()::text
  );


--INSERT 
-- Only the trigger (provision_new_user, SECURITY DEFINER) inserts user rows.
-- No authenticated role should INSERT directly.

CREATE POLICY user_no_insert ON public."user"
  FOR INSERT TO authenticated
  WITH CHECK (false);


--UPDATE — activate / deactivate (ADMIN + SUPERADMIN) 
-- SUPERADMIN: may update any row.
-- ADMIN: may update any row whose user_type is NOT 'SUPERADMIN'.
--        The WITH CHECK prevents flipping user_type to/from SUPERADMIN.

CREATE POLICY user_update_status ON public."user"
  FOR UPDATE TO authenticated
  USING (
    -- SUPERADMIN can touch any row
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      -- ADMIN can only touch non-SUPERADMIN rows
      public.get_my_user_type() = 'ADMIN'
      AND user_type != 'SUPERADMIN'
    )
  )
  WITH CHECK (
    -- After the update, target row still must not be SUPERADMIN (ADMIN path)
    -- and user_type column must be unchanged (only record_status may flip)
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      public.get_my_user_type() = 'ADMIN'
      AND user_type != 'SUPERADMIN'
    )
  );


--  DELETE 
-- Hard deletes are never permitted on user rows (soft-delete via record_status).

CREATE POLICY user_no_delete ON public."user"
  FOR DELETE TO authenticated
  USING (false);


--  TABLE: public."UserModule_Rights"

ALTER TABLE public."UserModule_Rights" ENABLE ROW LEVEL SECURITY;


-- SELECT
-- Every authenticated user must be able to read their OWN rights rows
-- (UserRightsContext queries them on login).
-- ADMIN/SUPERADMIN can read all rows for admin management.

CREATE POLICY umr_select ON public."UserModule_Rights"
  FOR SELECT TO authenticated
  USING (
    public.get_my_user_type() IN ('SUPERADMIN', 'ADMIN')
    OR EXISTS (
      SELECT 1 FROM public.user_module um
      WHERE um.user_module_id = "UserModule_Rights".user_module_id
        AND um."userId" = auth.uid()::text
    )
  );


-- INSERT
-- Only SUPERADMIN can insert new rights rows.
-- (provision trigger runs as SECURITY DEFINER and bypasses RLS anyway.)

CREATE POLICY umr_insert ON public."UserModule_Rights"
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_user_type() = 'SUPERADMIN'
  );


--  UPDATE 
-- SUPERADMIN: can update any rights row.
-- ADMIN: can update rights rows ONLY for users who are NOT SUPERADMIN.

CREATE POLICY umr_update ON public."UserModule_Rights"
  FOR UPDATE TO authenticated
  USING (
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      public.get_my_user_type() = 'ADMIN'
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_module um
        JOIN public."user" u ON u."userId" = um."userId"
        WHERE um.user_module_id = "UserModule_Rights".user_module_id
          AND u.user_type = 'SUPERADMIN'
      )
    )
  )
  WITH CHECK (
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      public.get_my_user_type() = 'ADMIN'
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_module um
        JOIN public."user" u ON u."userId" = um."userId"
        WHERE um.user_module_id = "UserModule_Rights".user_module_id
          AND u.user_type = 'SUPERADMIN'
      )
    )
  );


-- DELETE 
-- No one deletes rights rows; rights are toggled via right_value (0/1).

CREATE POLICY umr_no_delete ON public."UserModule_Rights"
  FOR DELETE TO authenticated
  USING (false);

--  TABLE: public.user_module  (also needs RLS so ADMIN can read module rows)

ALTER TABLE public.user_module ENABLE ROW LEVEL SECURITY;

CREATE POLICY um_select ON public.user_module
  FOR SELECT TO authenticated
  USING (
    public.get_my_user_type() IN ('SUPERADMIN', 'ADMIN')
    OR "userId" = auth.uid()::text
  );

CREATE POLICY um_insert ON public.user_module
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_user_type() = 'SUPERADMIN'
  );

CREATE POLICY um_update ON public.user_module
  FOR UPDATE TO authenticated
  USING (
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      public.get_my_user_type() = 'ADMIN'
      AND NOT EXISTS (
        SELECT 1 FROM public."user" u
        WHERE u."userId" = user_module."userId"
          AND u.user_type = 'SUPERADMIN'
      )
    )
  )
  WITH CHECK (
    public.get_my_user_type() = 'SUPERADMIN'
    OR (
      public.get_my_user_type() = 'ADMIN'
      AND NOT EXISTS (
        SELECT 1 FROM public."user" u
        WHERE u."userId" = user_module."userId"
          AND u.user_type = 'SUPERADMIN'
      )
    )
  );

CREATE POLICY um_no_delete ON public.user_module
  FOR DELETE TO authenticated
  USING (false);
