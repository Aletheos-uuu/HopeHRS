Initial SQL:

-- 1. Ensure Profiles table exists with correct columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    record_status TEXT DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modules table to define system features
CREATE TABLE IF NOT EXISTS public.modules (
    id SERIAL PRIMARY KEY,
    module_name TEXT UNIQUE NOT NULL,
    display_name TEXT
);

-- 3. User Rights table to manage permissions
CREATE TABLE IF NOT EXISTS public.user_rights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    module_id INTEGER REFERENCES public.modules ON DELETE CASCADE NOT NULL,
    access_level INTEGER DEFAULT 0, -- 0: None, 1: View, 2: Create, 3: Edit, 4: Delete
    UNIQUE(user_id, module_id)
);

-- 4. Seed Modules (17 modules for the HRIS system)
INSERT INTO public.modules (module_name, display_name)
VALUES 
('DASHBOARD', 'Dashboard'),
('EMPLOYEES', 'Employees'),
('DEPARTMENTS', 'Departments'),
('JOBS', 'Jobs'),
('JOB_HISTORY', 'Job History'),
('LOCATIONS', 'Locations'),
('COUNTRIES', 'Countries'),
('REGIONS', 'Regions'),
('ADMIN_PANEL', 'Admin Panel'),
('USER_MANAGEMENT', 'User Management'),
('ROLE_ASSIGNMENT', 'Role Assignment'),
('AUDIT_LOGS', 'Audit Logs'),
('DELETED_ITEMS', 'Trash/Deleted Items'),
('REPORTS', 'Reports'),
('SETTINGS', 'Settings'),
('PROFILE_MGMT', 'My Profile'),
('HELP_SUPPORT', 'Help & Support')
ON CONFLICT (module_name) DO NOTHING;

-- 5. Provisioning Function
-- This function runs every time a new user record is created in auth.users
CREATE OR REPLACE FUNCTION public.provision_new_user() 
RETURNS trigger AS $$
DECLARE
    module_rec RECORD;
BEGIN
    -- A. Create the profile row
    INSERT INTO public.profiles (id, username, first_name, last_name)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
        new.raw_user_meta_data->>'first_name', 
        new.raw_user_meta_data->>'last_name'
    );

    -- B. Provision 17 Module Rights
    -- 16 modules at access_level 0 (None)
    -- 1 module (DASHBOARD) at access_level 1 (View)
    FOR module_rec IN SELECT id, module_name FROM public.modules LOOP
        INSERT INTO public.user_rights (user_id, module_id, access_level)
        VALUES (
            new.id, 
            module_rec.id, 
            CASE WHEN module_rec.module_name = 'DASHBOARD' THEN 1 ELSE 0 END
        );
    END LOOP;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();