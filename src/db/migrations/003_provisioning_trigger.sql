-- 003_provision_trigger.sql
-- HopeHRS — Auth Provision Trigger


CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  m_rec    RECORD;
  r_rec    RECORD;
  v_umid   INTEGER;
  v_old_id VARCHAR(50);
BEGIN
  -- If this email is already seeded (e.g. superadmins), update userId to the
  -- real auth UUID so RLS policies (which check auth.uid()) actually work.
  SELECT "userId" INTO v_old_id
  FROM public."user"
  WHERE email = NEW.email;

  IF FOUND THEN
    -- Cascade the userId rename to user_module first (FK child), then parent
    UPDATE public.user_module
    SET "userId" = NEW.id::text
    WHERE "userId" = v_old_id;

    UPDATE public."user"
    SET "userId" = NEW.id::text
    WHERE email = NEW.email;

    RETURN NEW;
  END IF;

  -- New user: create row + full module/rights scaffold
  INSERT INTO public."user" ("userId", email, username, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    'USER',
    'INACTIVE',
    'AUTO-PROVISIONED'
  );

  FOR m_rec IN SELECT module_code FROM public."Module" LOOP
    INSERT INTO public.user_module ("userId", module_code, rights_value)
    VALUES (NEW.id::text, m_rec.module_code, 0)
    RETURNING user_module_id INTO v_umid;

    FOR r_rec IN SELECT rights_code FROM public.rights WHERE module_code = m_rec.module_code LOOP
      INSERT INTO public."UserModule_Rights" (user_module_id, rights_code, right_value)
      VALUES (
        v_umid,
        r_rec.rights_code,
        CASE WHEN r_rec.rights_code LIKE '%_VIEW' THEN 1 ELSE 0 END
      );
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();