-- HopeHRS - Migration 007: Soft-Delete Cascade Trigger
-- PR-07  db/triggers
-- Fixed: SECURITY DEFINER, ACTIVE-only soft-delete, stamp-scoped recovery

CREATE OR REPLACE FUNCTION cascade_employee_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Soft delete: employee ACTIVE → INACTIVE
  -- Only touch currently ACTIVE jobHistory rows (fix #1 + #3)
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'INACTIVE',
      stamp = 'CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND record_status = 'ACTIVE';  -- only touch currently active rows
  END IF;

  -- Recovery: employee INACTIVE → ACTIVE
  -- Only restore rows this cascade previously deactivated (fix #2)
  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'ACTIVE',
      stamp = 'CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND stamp LIKE 'CASCADE-DEL ' || NEW.empno || '%';  -- only rows we deactivated
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status ON employee
  FOR EACH ROW
  EXECUTE FUNCTION cascade_employee_soft_delete();