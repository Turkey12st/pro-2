-- تفعيل Realtime على الجداول الحرجة
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_salaries;
ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE data_sync_log;
ALTER PUBLICATION supabase_realtime ADD TABLE payroll_cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;

-- إنشاء Triggers للتحديث التلقائي
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_employee_salary_change') THEN
    CREATE TRIGGER on_employee_salary_change
      AFTER UPDATE ON employees
      FOR EACH ROW
      EXECUTE FUNCTION trigger_update_employee_salary();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_leave_status_change') THEN
    CREATE TRIGGER on_leave_status_change
      AFTER UPDATE ON leaves
      FOR EACH ROW
      EXECUTE FUNCTION trigger_leave_balance_update();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_salary_approval') THEN
    CREATE TRIGGER on_salary_approval
      AFTER UPDATE ON employee_salaries
      FOR EACH ROW
      EXECUTE FUNCTION trigger_payroll_to_finance();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employees') THEN
    CREATE TRIGGER set_updated_at_employees
      BEFORE UPDATE ON employees
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employee_salaries') THEN
    CREATE TRIGGER set_updated_at_employee_salaries
      BEFORE UPDATE ON employee_salaries
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;