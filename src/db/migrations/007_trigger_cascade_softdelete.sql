-- HopeHRS - Migration 007: Soft-Delete Cascade Trigger
-- PR-03  db/trigger-cascade-softdelete
-- Cascade trigger: employee → jobHistory status sync
-- Fixed: SECURITY DEFINER, ACTIVE-only soft-delete, stamp-scoped recovery

CREATE OR REPLACE FUNCTION cascade_employee_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Soft delete: employee ACTIVE → INACTIVE
  -- Only touch currently ACTIVE jobHistory rows
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'INACTIVE',
      stamp = 'CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND record_status = 'ACTIVE';
  END IF;

  -- Recovery: only restore rows this cascade previously deactivated
  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE jobHistory
    SET
      record_status = 'ACTIVE',
      stamp = 'CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND stamp LIKE 'CASCADE-DEL ' || NEW.empno || '%';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status ON employee
  FOR EACH ROW
  EXECUTE FUNCTION cascade_employee_soft_delete();

