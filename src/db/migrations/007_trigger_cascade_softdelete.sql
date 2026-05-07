-- 007_trigger_cascade_softdelete.sql
-- HopeHRS — Cascade Soft-Delete Trigger

--CASCADE SOFT-DELETE TRIGGER
-- employee INACTIVE → all their jobHistory rows INACTIVE
-- employee ACTIVE   → restore only the rows this cascade deactivated

CREATE OR REPLACE FUNCTION public.cascade_employee_soft_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.record_status = 'INACTIVE' AND OLD.record_status = 'ACTIVE' THEN
    UPDATE public.jobHistory
    SET record_status = 'INACTIVE',
        stamp = 'CASCADE-DEL ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND record_status = 'ACTIVE';
  END IF;

  IF NEW.record_status = 'ACTIVE' AND OLD.record_status = 'INACTIVE' THEN
    UPDATE public.jobHistory
    SET record_status = 'ACTIVE',
        stamp = 'CASCADE-RECOVER ' || NEW.empno || ' ' || NOW()::text
    WHERE empNo = NEW.empno
      AND stamp LIKE 'CASCADE-DEL ' || NEW.empno || '%';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employee_status_change
  AFTER UPDATE OF record_status ON public.employee
  FOR EACH ROW EXECUTE FUNCTION public.cascade_employee_soft_delete();