
-- 1) Clean up conflicting policies on journal_entries / journal_entry_items
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.journal_entry_items;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can read journal entry items" ON public.journal_entry_items;
DROP POLICY IF EXISTS "Users can read journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can view journal entries in their companies" ON public.journal_entries;
DROP POLICY IF EXISTS "je_select_finance" ON public.journal_entries;
DROP POLICY IF EXISTS "je_insert_finance" ON public.journal_entries;
DROP POLICY IF EXISTS "je_update_finance" ON public.journal_entries;
DROP POLICY IF EXISTS "je_delete_admin" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Accountants can insert journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Accountants can update journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON public.journal_entries;

CREATE OR REPLACE FUNCTION public.can_access_company_finance(_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant','finance_manager'])
     AND (_company IS NULL OR _company IN (SELECT public.get_user_companies(auth.uid())));
$$;

CREATE POLICY "je_select" ON public.journal_entries FOR SELECT TO authenticated
USING (public.can_access_company_finance(company_id));

CREATE POLICY "je_insert" ON public.journal_entries FOR INSERT TO authenticated
WITH CHECK (public.can_access_company_finance(company_id));

CREATE POLICY "je_update" ON public.journal_entries FOR UPDATE TO authenticated
USING (public.can_access_company_finance(company_id))
WITH CHECK (public.can_access_company_finance(company_id));

CREATE POLICY "je_delete" ON public.journal_entries FOR DELETE TO authenticated
USING (
  status <> 'posted'
  AND public.has_any_role(auth.uid(), ARRAY['admin','owner'])
  AND (company_id IS NULL OR company_id IN (SELECT public.get_user_companies(auth.uid())))
);

CREATE POLICY "jei_all" ON public.journal_entry_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.journal_entries je
               WHERE je.id = journal_entry_id AND public.can_access_company_finance(je.company_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.journal_entries je
               WHERE je.id = journal_entry_id AND public.can_access_company_finance(je.company_id)));

REVOKE ALL ON FUNCTION public.can_access_company_finance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_company_finance(uuid) TO authenticated, service_role;

-- 2) Block posting unbalanced / empty entries
CREATE OR REPLACE FUNCTION public.enforce_posted_entry_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_debit numeric; v_credit numeric; v_lines int;
BEGIN
  IF NEW.status = 'posted' AND COALESCE(OLD.status,'') <> 'posted' THEN
    SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0), COUNT(*)
      INTO v_debit, v_credit, v_lines
    FROM public.journal_entry_items WHERE journal_entry_id = NEW.id;

    IF v_lines < 2 THEN
      RAISE EXCEPTION 'لا يمكن ترحيل قيد بدون بنود (بندين على الأقل)';
    END IF;
    IF ABS(v_debit - v_credit) > 0.009 THEN
      RAISE EXCEPTION 'القيد غير متوازن: مدين % ≠ دائن %', v_debit, v_credit;
    END IF;

    NEW.total_debit := v_debit;
    NEW.total_credit := v_credit;
    NEW.posted_at := COALESCE(NEW.posted_at, now());
    NEW.posted_by := COALESCE(NEW.posted_by, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_je_balance_on_post ON public.journal_entries;
CREATE TRIGGER trg_je_balance_on_post
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_posted_entry_balance();

-- 3) Salary entry: use proper sub-accounts
CREATE OR REPLACE FUNCTION public.create_salary_journal_entry(emp_id uuid, salary_record_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  journal_id uuid; emp_name text; emp_number text; emp_company uuid;
  salary_data record; acc_expense uuid; acc_payable uuid; acc_gosi uuid;
BEGIN
  SELECT e.name, e.employment_number, e.company_id
    INTO emp_name, emp_number, emp_company
  FROM public.employees e WHERE e.id = emp_id;

  SELECT * INTO salary_data FROM public.salary_records WHERE id = salary_record_id;
  IF salary_data IS NULL THEN RAISE EXCEPTION 'سجل الراتب غير موجود'; END IF;

  acc_expense := public.get_or_create_account(emp_company, '5110', 'مصروف الرواتب والأجور', 'expense', 'debit');
  acc_payable := public.get_or_create_account(emp_company, '2110', 'رواتب مستحقة الدفع', 'liability', 'credit');
  acc_gosi    := public.get_or_create_account(emp_company, '2120', 'التأمينات الاجتماعية المستحقة', 'liability', 'credit');

  INSERT INTO public.journal_entries (
    description, entry_date, reference_number, status, entry_type, company_id
  ) VALUES (
    'راتب الموظف ' || COALESCE(emp_name,'') || ' لشهر ' || to_char(salary_data.payment_date, 'YYYY-MM'),
    salary_data.payment_date,
    'SAL-' || COALESCE(emp_number, LEFT(emp_id::text,8)) || '-' || to_char(salary_data.payment_date, 'YYYYMM'),
    'draft', 'payroll', emp_company
  ) RETURNING id INTO journal_id;

  INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
  VALUES (journal_id, acc_expense, 'راتب إجمالي - ' || COALESCE(emp_name,''), salary_data.total_salary, 0);

  INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
  VALUES (journal_id, acc_payable, 'صافي الراتب المستحق', 0,
    salary_data.total_salary - COALESCE(salary_data.gosi_subscription, 0));

  IF COALESCE(salary_data.gosi_subscription, 0) > 0 THEN
    INSERT INTO public.journal_entry_items (journal_entry_id, account_id, description, debit, credit)
    VALUES (journal_id, acc_gosi, 'تأمينات اجتماعية - حصة الموظف', 0, salary_data.gosi_subscription);
  END IF;

  UPDATE public.journal_entries SET status = 'posted' WHERE id = journal_id;

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
END; $$;
