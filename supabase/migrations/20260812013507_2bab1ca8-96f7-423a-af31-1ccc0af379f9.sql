
DROP TRIGGER IF EXISTS setup_new_employee_trigger ON public.employees;
DROP TRIGGER IF EXISTS trg_employee_setup ON public.employees;
DROP TRIGGER IF EXISTS set_updated_at_employees ON public.employees;
DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS trg_employee_salary_sync ON public.employees;
DROP TRIGGER IF EXISTS trigger_employee_salary_update ON public.employees;

DROP TRIGGER IF EXISTS trg_payroll_to_finance ON public.employee_salaries;
DROP TRIGGER IF EXISTS trigger_payroll_finance ON public.employee_salaries;
DROP TRIGGER IF EXISTS trigger_salary_to_finance ON public.employee_salaries;
DROP TRIGGER IF EXISTS set_updated_at_employee_salaries ON public.employee_salaries;
DROP TRIGGER IF EXISTS trg_employee_salaries_updated_at ON public.employee_salaries;

DROP TRIGGER IF EXISTS trg_audit_chart_of_accounts ON public.chart_of_accounts;
DROP TRIGGER IF EXISTS trg_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS trg_commission_rules_updated_at ON public.commission_rules;
DROP TRIGGER IF EXISTS trg_commissions_updated_at ON public.commissions;
