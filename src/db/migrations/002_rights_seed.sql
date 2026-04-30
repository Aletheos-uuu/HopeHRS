-- USER table

CREATE TABLE IF NOT EXISTS "user" (
  userId        VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  username      VARCHAR(50),
  user_type     VARCHAR(20)  NOT NULL DEFAULT 'USER',
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE',
  stamp         VARCHAR(60),
  PRIMARY KEY (userId),
  CONSTRAINT user_type_ck   CHECK (user_type   IN ('SUPERADMIN','ADMIN','USER')),
  CONSTRAINT user_status_ck CHECK (record_status IN ('ACTIVE','INACTIVE'))
);
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
  ('Adm_Mod',  'Admin Module',       'ACTIVE', 'SEEDED');

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
  ('ADM_USER', 'Admin Activate User',      1, 'Adm_Mod',  'ACTIVE', 'SEEDED');

-- USER_MODULE
CREATE TABLE IF NOT EXISTS user_module (
  user_module_id SERIAL      NOT NULL,
  userId         VARCHAR(50) NOT NULL REFERENCES "user"(userId) ON DELETE CASCADE,
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

-- SUPERADMIN seed: jcesperanza@neu.edu.ph — all 17 rights = 1

INSERT INTO "user" (userId, email, username, user_type, record_status, stamp)
VALUES ('user1', 'jcesperanza@neu.edu.ph', 'jcesperanza', 'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (email) DO NOTHING;

-- Give SUPERADMIN a user_module row for all 5 modules
INSERT INTO user_module (userId, module_code, rights_value)
SELECT 'user1', module_code, 1
FROM   "Module"
ON CONFLICT (userId, module_code) DO NOTHING;

-- Grant all 17 rights = 1
INSERT INTO "UserModule_Rights" (user_module_id, rights_code, right_value)
SELECT um.user_module_id, r.rights_code, 1
FROM   user_module um
JOIN   rights r ON r.module_code = um.module_code
WHERE  um.userId = 'user1'
ON CONFLICT (user_module_id, rights_code) DO UPDATE SET right_value = 1;
