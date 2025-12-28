-- إصلاح أمان قاعدة البيانات

-- 1. تفعيل RLS على الجداول التي لا تحتوي عليه
ALTER TABLE IF EXISTS public."Pro-1.1" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.capital_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."company_Info" ENABLE ROW LEVEL SECURITY;

-- 2. إنشاء سياسات RLS للجداول

-- سياسات attendance_files
CREATE POLICY "HR staff can manage attendance files"
ON public.attendance_files
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'owner', 'hr_manager')
  )
);

-- سياسات capital_movements
CREATE POLICY "Admins can manage capital movements"
ON public.capital_movements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'owner')
  )
);

CREATE POLICY "Financial staff can view capital movements"
ON public.capital_movements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'owner', 'accountant')
  )
);

-- سياسات company_Info
CREATE POLICY "Authenticated users can view company info"
ON public."company_Info"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage company info"
ON public."company_Info"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'owner')
  )
);

-- سياسات Pro-1.1
CREATE POLICY "Authenticated users can access Pro-1.1"
ON public."Pro-1.1"
FOR ALL
TO authenticated
USING (true);

-- 3. إصلاح الدوال بإضافة search_path

-- إعادة إنشاء دالة get_account_path مع search_path آمن
CREATE OR REPLACE FUNCTION public.get_account_path(account_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  path TEXT[];
  current_id UUID := account_id;
  current_name TEXT;
  parent_id UUID;
BEGIN
  WHILE current_id IS NOT NULL LOOP
      SELECT account_name, parent_account_id INTO current_name, parent_id
      FROM public.chart_of_accounts
      WHERE id = current_id;
      
      path := current_name || path;
      current_id := parent_id;
  END LOOP;
  
  RETURN path;
END;
$$;

-- إعادة إنشاء دالة calculate_cash_flow مع search_path آمن
CREATE OR REPLACE FUNCTION public.calculate_cash_flow(start_date date, end_date date)
RETURNS TABLE(total_inflow numeric, total_outflow numeric, net_flow numeric, flow_ratio numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH inflows AS (
    SELECT COALESCE(SUM(credit_amount), 0) as total_in
    FROM public.accounting_transactions
    WHERE transaction_date BETWEEN start_date AND end_date
    AND credit_amount > 0
  ),
  outflows AS (
    SELECT COALESCE(SUM(debit_amount), 0) as total_out
    FROM public.accounting_transactions
    WHERE transaction_date BETWEEN start_date AND end_date
    AND debit_amount > 0
  )
  SELECT 
    i.total_in,
    o.total_out,
    (i.total_in - o.total_out),
    CASE 
      WHEN o.total_out > 0 THEN ((i.total_in - o.total_out) / o.total_out) * 100
      ELSE 0
    END
  FROM inflows i, outflows o;
END;
$$;

-- إعادة إنشاء دالة calculate_employee_kpi مع search_path آمن
CREATE OR REPLACE FUNCTION public.calculate_employee_kpi(emp_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  task_completion_rate numeric := 0;
  project_success_rate numeric := 0;
  attendance_rate numeric := 100;
  total_tasks integer := 0;
  completed_tasks integer := 0;
  total_projects integer := 0;
  completed_projects integer := 0;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM public.project_tasks pt
  WHERE pt.assignee_id = emp_id;

  SELECT COUNT(*) INTO completed_tasks
  FROM public.project_tasks pt
  WHERE pt.assignee_id = emp_id AND pt.status = 'completed';

  IF total_tasks > 0 THEN
    task_completion_rate := (completed_tasks * 100.0) / total_tasks;
  END IF;

  SELECT COUNT(*) INTO total_projects
  FROM public.project_employee_assignments pea
  WHERE pea.employee_id = emp_id;

  SELECT COUNT(*) INTO completed_projects
  FROM public.project_employee_assignments pea
  JOIN public.projects p ON p.id = pea.project_id
  WHERE pea.employee_id = emp_id AND p.status = 'completed';

  IF total_projects > 0 THEN
    project_success_rate := (completed_projects * 100.0) / total_projects;
  END IF;

  result := jsonb_build_object(
    'task_completion_rate', task_completion_rate,
    'project_success_rate', project_success_rate,
    'attendance_rate', attendance_rate,
    'total_tasks', total_tasks,
    'completed_tasks', completed_tasks,
    'total_projects', total_projects,
    'completed_projects', completed_projects,
    'overall_score', (task_completion_rate + project_success_rate + attendance_rate) / 3
  );

  UPDATE public.employee_performance 
  SET 
    performance_score = (result->>'overall_score')::numeric,
    tasks_completed = completed_tasks,
    projects_completed = completed_projects,
    attendance_rate = attendance_rate,
    kpi_metrics = result
  WHERE employee_id = emp_id 
    AND evaluation_period = 'تقييم أولي';

  RETURN result;
END;
$$;

-- إعادة إنشاء دالة create_employee_accounts مع search_path آمن
CREATE OR REPLACE FUNCTION public.create_employee_accounts(emp_id uuid, emp_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_number text;
BEGIN
  SELECT employment_number INTO emp_number FROM public.employees WHERE id = emp_id;
  IF emp_number IS NULL THEN
    emp_number := 'EMP' || LPAD(extract(epoch from now())::text, 10, '0');
    UPDATE public.employees SET employment_number = emp_number WHERE id = emp_id;
  END IF;

  INSERT INTO public.employee_accounts (employee_id, account_number, account_name, account_type)
  VALUES (emp_id, '5100' || emp_number, 'راتب ' || emp_name, 'expense');

  INSERT INTO public.employee_accounts (employee_id, account_number, account_name, account_type)
  VALUES (emp_id, '2100' || emp_number, 'مستحقات ' || emp_name, 'liability');

  INSERT INTO public.employee_accounts (employee_id, account_number, account_name, account_type)
  VALUES (emp_id, '5200' || emp_number, 'تأمينات اجتماعية - حصة الشركة - ' || emp_name, 'expense');

  INSERT INTO public.employee_accounts (employee_id, account_number, account_name, account_type)
  VALUES (emp_id, '2200' || emp_number, 'تأمينات اجتماعية - حصة الموظف - ' || emp_name, 'liability');
END;
$$;

-- إعادة إنشاء دالة create_salary_journal_entry مع search_path آمن
CREATE OR REPLACE FUNCTION public.create_salary_journal_entry(emp_id uuid, salary_record_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  journal_id uuid;
  emp_name text;
  emp_number text;
  salary_data record;
BEGIN
  SELECT e.name, e.employment_number INTO emp_name, emp_number
  FROM public.employees e WHERE e.id = emp_id;

  SELECT * INTO salary_data FROM public.salary_records WHERE id = salary_record_id;

  INSERT INTO public.journal_entries (
    description, entry_date, total_debit, total_credit, 
    reference_number, status, created_by
  ) VALUES (
    'راتب الموظف ' || emp_name || ' لشهر ' || to_char(salary_data.payment_date, 'YYYY-MM'),
    salary_data.payment_date,
    salary_data.total_salary,
    salary_data.total_salary,
    'SAL-' || emp_number || '-' || to_char(salary_data.payment_date, 'YYYYMM'),
    'posted',
    '00000000-0000-0000-0000-000000000000'
  ) RETURNING id INTO journal_id;

  INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
  VALUES (journal_id, '5100' || emp_number, 'راتب إجمالي', salary_data.total_salary, 0);

  INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
  VALUES (journal_id, '2100' || emp_number, 'راتب صافي مستحق', 0, 
    salary_data.total_salary - COALESCE(salary_data.gosi_subscription, 0));

  IF COALESCE(salary_data.gosi_subscription, 0) > 0 THEN
    INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
    VALUES (journal_id, '2200' || emp_number, 'تأمينات اجتماعية - حصة الموظف', 0, salary_data.gosi_subscription);
  END IF;

  INSERT INTO public.payroll_journal_entries (
    employee_id, journal_entry_id, salary_record_id,
    gross_salary, net_salary, total_deductions, gosi_employee
  ) VALUES (
    emp_id, journal_id, salary_record_id,
    salary_data.total_salary,
    salary_data.total_salary - COALESCE(salary_data.gosi_subscription, 0),
    COALESCE(salary_data.gosi_subscription, 0),
    COALESCE(salary_data.gosi_subscription, 0)
  );

  RETURN journal_id;
END;
$$;

-- إعادة إنشاء دالة delete_journal_entry مع search_path آمن
CREATE OR REPLACE FUNCTION public.delete_journal_entry(p_entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.journal_entries
  WHERE id = p_entry_id;
END;
$$;

-- إعادة إنشاء دالة get_all_companies مع search_path آمن
CREATE OR REPLACE FUNCTION public.get_all_companies()
RETURNS TABLE(id uuid, name text, unified_national_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, ci.company_name as name, ci."Unified National Number"::text as unified_national_number
  FROM public."company_Info" ci;
END;
$$;