
DROP POLICY IF EXISTS "auth_all_payroll_cycles" ON public.payroll_cycles;
DROP POLICY IF EXISTS "auth_select_payroll_cycles" ON public.payroll_cycles;
DROP POLICY IF EXISTS "auth_all_salary_components" ON public.salary_components;
DROP POLICY IF EXISTS "auth_select_salary_components" ON public.salary_components;

CREATE POLICY "HR and finance manage payroll cycles"
ON public.payroll_cycles FOR ALL TO authenticated
USING (public.is_admin_owner() OR public.is_hr_or_finance())
WITH CHECK (public.is_admin_owner() OR public.is_hr_or_finance());

CREATE POLICY "HR and finance manage salary components"
ON public.salary_components FOR ALL TO authenticated
USING (public.is_admin_owner() OR public.is_hr_or_finance())
WITH CHECK (public.is_admin_owner() OR public.is_hr_or_finance());
