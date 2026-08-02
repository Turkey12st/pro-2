
CREATE OR REPLACE FUNCTION public.is_hr_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']);
$$;
CREATE OR REPLACE FUNCTION public.is_finance_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant','finance_manager']);
$$;
CREATE OR REPLACE FUNCTION public.is_hr_or_finance()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant','finance_manager']);
$$;
CREATE OR REPLACE FUNCTION public.is_admin_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin','owner']);
$$;
REVOKE ALL ON FUNCTION public.is_hr_staff(), public.is_finance_staff(), public.is_hr_or_finance(), public.is_admin_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hr_staff(), public.is_finance_staff(), public.is_hr_or_finance(), public.is_admin_owner() TO authenticated, service_role;

-- Employees
DROP POLICY IF EXISTS "Authenticated can read employees" ON public.employees;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;

-- Salary / payroll
DROP POLICY IF EXISTS "auth_all_employee_salaries" ON public.employee_salaries;
DROP POLICY IF EXISTS "auth_select_employee_salaries" ON public.employee_salaries;
CREATE POLICY "employee_salaries_staff" ON public.employee_salaries FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.salary_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.salary_records;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.salary_records;
CREATE POLICY "salary_records_staff" ON public.salary_records FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

DROP POLICY IF EXISTS "auth_all_salary_details" ON public.salary_details;
DROP POLICY IF EXISTS "auth_select_salary_details" ON public.salary_details;
CREATE POLICY "salary_details_staff" ON public.salary_details FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.employee_accounts;
CREATE POLICY "employee_accounts_staff" ON public.employee_accounts FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.employee_incentives;
CREATE POLICY "employee_incentives_staff" ON public.employee_incentives FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.employee_performance;
CREATE POLICY "employee_performance_staff" ON public.employee_performance FOR ALL TO authenticated
USING (public.is_hr_staff()) WITH CHECK (public.is_hr_staff());

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.payroll_journal_entries;
CREATE POLICY "payroll_je_manage" ON public.payroll_journal_entries FOR ALL TO authenticated
USING (public.is_hr_or_finance()) WITH CHECK (public.is_hr_or_finance());

-- Company data
DROP POLICY IF EXISTS "Authenticated users can view company info" ON public."company_Info";
CREATE POLICY "company_info_staff_select" ON public."company_Info" FOR SELECT TO authenticated
USING (public.is_finance_staff());
CREATE POLICY "company_info_admin_manage" ON public."company_Info" FOR ALL TO authenticated
USING (public.is_admin_owner()) WITH CHECK (public.is_admin_owner());

DROP POLICY IF EXISTS "Authenticated users can view company partners" ON public.company_partners;
DROP POLICY IF EXISTS "Authenticated users can insert company partners" ON public.company_partners;
DROP POLICY IF EXISTS "Authenticated users can update their own company partners" ON public.company_partners;
DROP POLICY IF EXISTS "Authenticated users can delete their own company partners" ON public.company_partners;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_partners;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.company_partners;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.company_partners;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.company_partners;
CREATE POLICY "company_partners_select" ON public.company_partners FOR SELECT TO authenticated
USING (public.is_finance_staff());
CREATE POLICY "company_partners_manage" ON public.company_partners FOR ALL TO authenticated
USING (public.is_admin_owner()) WITH CHECK (public.is_admin_owner());

DROP POLICY IF EXISTS "select_policy" ON public.capital;
CREATE POLICY "capital_finance_select" ON public.capital FOR SELECT TO authenticated
USING (public.is_finance_staff());

DROP POLICY IF EXISTS "Users can read capital history" ON public.capital_history;
CREATE POLICY "capital_history_finance_select" ON public.capital_history FOR SELECT TO authenticated
USING (public.is_finance_staff());

DROP POLICY IF EXISTS "capital_movements_select" ON public.capital_movements;
CREATE POLICY "capital_movements_finance_select" ON public.capital_movements FOR SELECT TO authenticated
USING (public.is_finance_staff());

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.financials;
CREATE POLICY "financials_finance_select" ON public.financials FOR SELECT TO authenticated
USING (public.is_finance_staff());

-- Clients
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
CREATE POLICY "clients_update_staff" ON public.clients FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager','sales_manager']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager','sales_manager']));
CREATE POLICY "clients_delete_admin" ON public.clients FOR DELETE TO authenticated
USING (public.is_admin_owner());

-- Leaves
DROP POLICY IF EXISTS "auth_all_leaves" ON public.leaves;
DROP POLICY IF EXISTS "auth_select_leaves" ON public.leaves;
CREATE POLICY "leaves_select" ON public.leaves FOR SELECT TO authenticated
USING (public.is_hr_staff() OR created_by = auth.uid());
CREATE POLICY "leaves_insert" ON public.leaves FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "leaves_update_hr" ON public.leaves FOR UPDATE TO authenticated
USING (public.is_hr_staff()) WITH CHECK (public.is_hr_staff());
CREATE POLICY "leaves_delete_hr" ON public.leaves FOR DELETE TO authenticated
USING (public.is_hr_staff());

-- Org structures
DROP POLICY IF EXISTS "auth_all_departments" ON public.departments;
CREATE POLICY "departments_manage" ON public.departments FOR ALL TO authenticated
USING (public.is_hr_staff()) WITH CHECK (public.is_hr_staff());

DROP POLICY IF EXISTS "auth_all_job_titles" ON public.job_titles;
CREATE POLICY "job_titles_manage" ON public.job_titles FOR ALL TO authenticated
USING (public.is_hr_staff()) WITH CHECK (public.is_hr_staff());

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.project_employee_assignments;
CREATE POLICY "pea_select" ON public.project_employee_assignments FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);
CREATE POLICY "pea_manage" ON public.project_employee_assignments FOR ALL TO authenticated
USING (public.is_hr_staff()) WITH CHECK (public.is_hr_staff());

-- Unused test tables
DROP POLICY IF EXISTS "Allow all access" ON public.example_table;
DROP POLICY IF EXISTS "Authenticated users can access example_table" ON public.example_table;
DROP POLICY IF EXISTS "Authenticated users can select from example_table" ON public.example_table;
DROP POLICY IF EXISTS "Authenticated users can insert into example_table" ON public.example_table;
DROP POLICY IF EXISTS "Authenticated users can update example_table" ON public.example_table;
DROP POLICY IF EXISTS "Authenticated users can delete from example_table" ON public.example_table;
CREATE POLICY "example_table_admin" ON public.example_table FOR ALL TO authenticated
USING (public.is_admin_owner()) WITH CHECK (public.is_admin_owner());

DROP POLICY IF EXISTS "Authenticated users can access Pro-1.1" ON public."Pro-1.1";
CREATE POLICY "pro11_admin" ON public."Pro-1.1" FOR ALL TO authenticated
USING (public.is_admin_owner()) WITH CHECK (public.is_admin_owner());

-- Privileged RPCs
REVOKE EXECUTE ON FUNCTION public.delete_journal_entry(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_api_integrations() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_api_integration(text,text,text,text,text,text[],boolean,text) FROM PUBLIC, anon, authenticated;
