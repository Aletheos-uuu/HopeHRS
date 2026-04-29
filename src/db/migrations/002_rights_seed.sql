-- PROFILES table

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID         NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  username      VARCHAR(50),
  user_type     VARCHAR(20)  NOT NULL DEFAULT 'USER',
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE',
  stamp         VARCHAR(60),
  PRIMARY KEY (id),
  CONSTRAINT user_type_ck   CHECK (user_type   IN ('SUPERADMIN','ADMIN','USER')),
  CONSTRAINT user_status_ck CHECK (record_status IN ('ACTIVE','INACTIVE'))
);

-- Handle new user registration sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, user_type, record_status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username', 'USER', 'INACTIVE');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MODULE table
CREATE TABLE IF NOT EXISTS "Module" (
  module_code   VARCHAR(20)  NOT NULL,
  module_name   VARCHAR(50)  NOT NULL,
  record_status VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
  stamp         VARCHAR(60),
  PRIMARY KEY (module_code)
);

INSERT INTO "Module" (module_code, module_name, record_status, stamp) VALUES
  ('Emp_Mod',  'Employee Module',    'ACTIVE', 'SEEDED'),
  ('JH_Mod',   'Job History Module', 'ACTIVE', 'SEEDED'),
  ('Job_Mod',  'Job Module',         'ACTIVE', 'SEEDED'),
  ('Dept_Mod', 'Department Module',  'ACTIVE', 'SEEDED'),
  ('Adm_Mod',  'Admin Module',       'ACTIVE', 'SEEDED')
ON CONFLICT (module_code) DO NOTHING;

-- RIGHTS table (17 rights)
CREATE TABLE IF NOT EXISTS rights (
  rights_code   VARCHAR(30)  NOT NULL,
  rights_name   VARCHAR(60)  NOT NULL,
  right_value   SMALLINT     NOT NULL DEFAULT 1,
  module_code   VARCHAR(20)  NOT NULL REFERENCES "Module"(module_code),
  record_status VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
  stamp         VARCHAR(60),
  PRIMARY KEY (rights_code),
  CONSTRAINT right_value_ck CHECK (right_value IN (0,1))
);

INSERT INTO rights (rights_code, rights_name, right_value, module_code, record_status, stamp) VALUES
  ('EMP_VIEW', 'View Employees',           1, 'Emp_Mod',  'ACTIVE', 'SEEDED'),
  ('EMP_ADD',  'Add Employee',             1, 'Emp_Mod',  'ACTIVE', 'SEEDED'),
  ('EMP_EDIT', 'Edit Employee',            1, 'Emp_Mod',  'ACTIVE', 'SEEDED'),
  ('EMP_DEL',  'Soft Delete Employee',     1, 'Emp_Mod',  'ACTIVE', 'SEEDED'),
  ('JH_VIEW',  'View Job History',         1, 'JH_Mod',   'ACTIVE', 'SEEDED'),
  ('JH_ADD',   'Add Job History',          1, 'JH_Mod',   'ACTIVE', 'SEEDED'),
  ('JH_EDIT',  'Edit Job History',         1, 'JH_Mod',   'ACTIVE', 'SEEDED'),
  ('JH_DEL',   'Soft Delete Job History',  1, 'JH_Mod',   'ACTIVE', 'SEEDED'),
  ('JOB_VIEW', 'View Jobs',                1, 'Job_Mod',  'ACTIVE', 'SEEDED'),
  ('JOB_ADD',  'Add Job',                  1, 'Job_Mod',  'ACTIVE', 'SEEDED'),
  ('JOB_EDIT', 'Edit Job',                 1, 'Job_Mod',  'ACTIVE', 'SEEDED'),
  ('JOB_DEL',  'Soft Delete Job',          1, 'Job_Mod',  'ACTIVE', 'SEEDED'),
  ('DEPT_VIEW','View Departments',         1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
  ('DEPT_ADD', 'Add Department',           1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
  ('DEPT_EDIT','Edit Department',          1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
  ('DEPT_DEL', 'Soft Delete Department',   1, 'Dept_Mod', 'ACTIVE', 'SEEDED'),
  ('ADM_USER', 'Admin Activate User',      1, 'Adm_Mod',  'ACTIVE', 'SEEDED')
ON CONFLICT (rights_code) DO NOTHING;

-- USER_MODULE
CREATE TABLE IF NOT EXISTS user_module (
  user_module_id SERIAL      NOT NULL,
  userId         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_code    VARCHAR(20) NOT NULL REFERENCES "Module"(module_code),
  rights_value   SMALLINT    NOT NULL DEFAULT 0,
  PRIMARY KEY (user_module_id),
  UNIQUE (userId, module_code)
);

-- USERMODULE_RIGHTS
CREATE TABLE IF NOT EXISTS "UserModule_Rights" (
  umr_id         SERIAL      NOT NULL,
  user_module_id INT         NOT NULL REFERENCES user_module(user_module_id) ON DELETE CASCADE,
  rights_code    VARCHAR(30) NOT NULL REFERENCES rights(rights_code),
  right_value    SMALLINT    NOT NULL DEFAULT 0,
  PRIMARY KEY (umr_id),
  UNIQUE (user_module_id, rights_code),
  CONSTRAINT umr_value_ck CHECK (right_value IN (0,1))
);

-- No static seed for profiles since ID is UUID from auth.users. 
-- In a real scenario, you'd apply this to an existing user ID.
