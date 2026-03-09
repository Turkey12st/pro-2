-- Add remaining triggers that failed (with IF NOT EXISTS pattern)
DROP TRIGGER IF EXISTS trigger_leave_balance ON public.leaves;
CREATE TRIGGER trigger_leave_balance
  AFTER INSERT OR UPDATE ON public.leaves
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_leave_balance_update();

DROP TRIGGER IF EXISTS trigger_payroll_finance ON public.employee_salaries;
CREATE TRIGGER trigger_payroll_finance
  AFTER UPDATE ON public.employee_salaries
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_payroll_to_finance();

DROP TRIGGER IF EXISTS audit_chart_of_accounts ON public.chart_of_accounts;
CREATE TRIGGER audit_chart_of_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_chart_of_accounts_changes();

DROP TRIGGER IF EXISTS audit_journal_entries ON public.journal_entries;
CREATE TRIGGER audit_journal_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_journal_entries_changes();

DROP TRIGGER IF EXISTS validate_entry_balance ON public.journal_entry_items;
CREATE TRIGGER validate_entry_balance
  AFTER INSERT OR UPDATE ON public.journal_entry_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_journal_entry_balance();

DROP TRIGGER IF EXISTS setup_new_employee_trigger ON public.employees;
CREATE TRIGGER setup_new_employee_trigger
  AFTER INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_new_employee();