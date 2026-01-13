
-- =============================================
-- تأمين الجداول الحساسة - حذف وإعادة إنشاء السياسات
-- =============================================

-- 1. جدول journal_entries - حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "Admins can delete journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Finance staff can view journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Finance staff can create journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Finance staff can update journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Accountants can manage journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can view journal entries in their company" ON public.journal_entries;

-- تفعيل RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات جديدة محسنة
CREATE POLICY "je_select_finance"
ON public.journal_entries FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant', 'finance_manager']::text[])
);

CREATE POLICY "je_insert_finance"
ON public.journal_entries FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant', 'finance_manager']::text[])
);

CREATE POLICY "je_update_finance"
ON public.journal_entries FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant', 'finance_manager']::text[])
);

CREATE POLICY "je_delete_admin"
ON public.journal_entries FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner']::text[])
);

-- 2. جدول chart_of_accounts - حذف جميع السياسات
DROP POLICY IF EXISTS "Finance staff can view chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Accountants can manage chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Accountants can update chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Admins can delete chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Users can view chart of accounts in their company" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Accountants can insert chart of accounts" ON public.chart_of_accounts;

-- تفعيل RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات جديدة
CREATE POLICY "coa_select_finance"
ON public.chart_of_accounts FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant', 'finance_manager', 'project_manager']::text[])
  AND (company_id IS NULL OR company_id IN (
    SELECT company_id FROM public.users_companies WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "coa_insert_accountant"
ON public.chart_of_accounts FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant']::text[])
);

CREATE POLICY "coa_update_accountant"
ON public.chart_of_accounts FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant']::text[])
);

CREATE POLICY "coa_delete_admin"
ON public.chart_of_accounts FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner']::text[])
);

-- 3. جدول employees - حذف جميع السياسات
DROP POLICY IF EXISTS "HR staff can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can view employees in their company" ON public.employees;
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Users can manage employees" ON public.employees;

-- تفعيل RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات جديدة
CREATE POLICY "emp_select_hr"
ON public.employees FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'hr_manager']::text[])
  OR created_by = auth.uid()
);

CREATE POLICY "emp_insert_hr"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'hr_manager']::text[])
);

CREATE POLICY "emp_update_hr"
ON public.employees FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'hr_manager']::text[])
);

CREATE POLICY "emp_delete_admin"
ON public.employees FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner']::text[])
);

-- 4. تأمين capital_management
DROP POLICY IF EXISTS "Finance staff can view capital" ON public.capital_management;
DROP POLICY IF EXISTS "Admins can manage capital" ON public.capital_management;

ALTER TABLE public.capital_management ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cap_select_finance"
ON public.capital_management FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'accountant', 'finance_manager']::text[])
);

CREATE POLICY "cap_manage_admin"
ON public.capital_management FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'owner']::text[])
);
