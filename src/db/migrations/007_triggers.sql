-- HopeHRS - Migration 007: Soft-Delete Cascade Trigger
-- PR-07  db/triggers
-- When employee is soft-deleted, all jobHistory rows → INACTIVE
-- When employee is recovered, all jobHistory rows → ACTIVE

CREATE OR REPLACE FUNCTION cascade_employee_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Soft delete: employee ACTIVE → INACTIVE
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'INACTIVE',
      stamp = 'CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno;
  END IF;

  -- Recovery: employee INACTIVE → ACTIVE
  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'ACTIVE',
      stamp = 'CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status ON employee
  FOR EACH ROW
  EXECUTE FUNCTION cascade_employee_soft_delete();