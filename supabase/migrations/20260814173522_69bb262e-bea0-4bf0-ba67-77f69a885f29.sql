
-- attendance_records: remove blanket read
DROP POLICY IF EXISTS "Authenticated can read attendance" ON public.attendance_records;

-- employee_leave_balances: remove blanket policies
DROP POLICY IF EXISTS "auth_all_leave_balances" ON public.employee_leave_balances;
DROP POLICY IF EXISTS "auth_select_leave_balances" ON public.employee_leave_balances;

CREATE POLICY "HR staff manage leave balances"
ON public.employee_leave_balances FOR ALL TO authenticated
USING (public.is_admin_owner() OR public.is_hr_staff())
WITH CHECK (public.is_admin_owner() OR public.is_hr_staff());

CREATE POLICY "Users can view their own leave balances"
ON public.employee_leave_balances FOR SELECT TO authenticated
USING (
  public.is_admin_owner() OR public.is_hr_staff()
  OR employee_id IN (SELECT e.id FROM public.employees e WHERE e.created_by = auth.uid())
);

-- partner_capital_distribution: restrict read to finance/admin
DROP POLICY IF EXISTS "Authenticated users can view partner capital" ON public.partner_capital_distribution;

CREATE POLICY "Finance staff can view partner capital"
ON public.partner_capital_distribution FOR SELECT TO authenticated
USING (public.is_admin_owner() OR public.is_finance_staff());
