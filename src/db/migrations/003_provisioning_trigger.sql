-- ==========================================
-- 1. DEFINE THE PROVISIONING FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER AS $$
DECLARE
    m_record RECORD;
    r_record RECORD;
    v_um_id INTEGER;
BEGIN
    -- Create the user row in your public "user" table
    -- Defaults to INACTIVE and USER type
    INSERT INTO public."user" (userId, email, username, user_type, record_status, stamp)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        'USER',
        'INACTIVE',
        'AUTO-PROVISIONED'
    );

    -- Loop through the 5 seeded modules
    FOR m_record IN SELECT module_code FROM public."Module" LOOP
        
        -- Insert into user_module junction[cite: 1]
        INSERT INTO public.user_module (userId, module_code, rights_value)
        VALUES (NEW.id, m_record.module_code, 0)
        RETURNING user_module_id INTO v_um_id;

        -- Loop through the 17 rights for the current module[cite: 1]
        FOR r_record IN SELECT rights_code FROM public.rights WHERE module_code = m_record.module_code LOOP
            
            -- Insert specific rights for the user[cite: 1]
            INSERT INTO public."UserModule_Rights" (user_module_id, rights_code, right_value)
            VALUES (
                v_um_id, 
                r_record.rights_code, 
                CASE 
                    -- Set VIEW rights to 1, all others (16) to 0[cite: 1]
                    WHEN r_record.rights_code LIKE '%_VIEW' THEN 1 
                    ELSE 0 
                END
            );
        END LOOP;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. ATTACH THE TRIGGER TO AUTH.USERS
-- ==========================================
-- Ensure any old version is removed before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.provision_new_user();