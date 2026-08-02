
-- 1) Helper: resolve or create a GL account
CREATE OR REPLACE FUNCTION public.get_or_create_account(
  p_company uuid, p_number text, p_name text, p_type text, p_balance_type text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.chart_of_accounts
   WHERE account_number = p_number AND (company_id = p_company OR company_id IS NULL)
   ORDER BY (company_id = p_company) DESC LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO public.chart_of_accounts (account_number, account_name, account_type, level, is_active, balance_type, company_id)
    VALUES (p_number, p_name, p_type, 3, true, p_balance_type, p_company)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END; $$;

-- 2) journal_entry_items.account_id -> real uuid FK to chart_of_accounts
ALTER TABLE public.journal_entry_items
  ALTER COLUMN account_id TYPE uuid USING NULLIF(account_id,'')::uuid;

ALTER TABLE public.journal_entry_items
  DROP CONSTRAINT IF EXISTS journal_entry_items_account_id_fkey;
ALTER TABLE public.journal_entry_items
  ADD CONSTRAINT journal_entry_items_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION public.sync_journal_item_account_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  SELECT account_number INTO NEW.account_number FROM public.chart_of_accounts WHERE id = NEW.account_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_jei_account_number
BEFORE INSERT OR UPDATE OF account_id ON public.journal_entry_items
FOR EACH ROW EXECUTE FUNCTION public.sync_journal_item_account_number();

-- 3) Recompute journal entry totals from items
CREATE TRIGGER trg_jei_recalc_totals
AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_items
FOR EACH ROW EXECUTE FUNCTION public.validate_journal_entry_on_item_change();

-- 4) Defaults on journal entries (company, creator, status)
CREATE OR REPLACE FUNCTION public.set_journal_entry_defaults()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.created_by IS NULL THEN NEW.created_by := auth.uid(); END IF;
  IF NEW.company_id IS NULL THEN
    NEW.company_id := COALESCE(public.get_default_company(auth.uid()),
                               (SELECT company_id FROM public.users_companies WHERE user_id = auth.uid() LIMIT 1));
  END IF;
  IF NEW.status IS NULL THEN NEW.status := 'draft'; END IF;
  IF NEW.currency IS NULL THEN NEW.currency := 'SAR'; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_je_defaults
BEFORE INSERT ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.set_journal_entry_defaults();

-- 5) Protect posted entries
CREATE OR REPLACE FUNCTION public.protect_posted_journal_entries()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'posted' THEN RAISE EXCEPTION 'لا يمكن حذف قيد مرحّل'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.status = 'posted' AND NEW.status = 'posted'
     AND (OLD.entry_date IS DISTINCT FROM NEW.entry_date
       OR OLD.description IS DISTINCT FROM NEW.description
       OR OLD.total_debit IS DISTINCT FROM NEW.total_debit
       OR OLD.total_credit IS DISTINCT FROM NEW.total_credit) THEN
    RAISE EXCEPTION 'لا يمكن تعديل قيد مرحّل، استخدم قيد عكسي';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_je_protect
BEFORE UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_journal_entries();

-- lock journal items of posted entries
CREATE OR REPLACE FUNCTION public.protect_posted_journal_items()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.journal_entries
   WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
  IF v_status = 'posted' THEN RAISE EXCEPTION 'لا يمكن تعديل بنود قيد مرحّل'; END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER trg_jei_protect
BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entry_items
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_journal_items();

-- 6) Audit triggers
CREATE TRIGGER trg_audit_journal_entries
AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.audit_journal_entries_changes();

CREATE TRIGGER trg_audit_chart_of_accounts
AFTER INSERT OR UPDATE OR DELETE ON public.chart_of_accounts
FOR EACH ROW EXECUTE FUNCTION public.audit_chart_of_accounts_changes();

-- 7) HR / payroll / tender cross-module triggers
CREATE TRIGGER trg_employee_setup
AFTER INSERT ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.setup_new_employee();

CREATE TRIGGER trg_employee_salary_sync
AFTER UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_employee_salary();

CREATE TRIGGER trg_salary_record_process
AFTER UPDATE ON public.salary_records
FOR EACH ROW EXECUTE FUNCTION public.process_salary_record();

CREATE TRIGGER trg_payroll_to_finance
AFTER UPDATE ON public.employee_salaries
FOR EACH ROW EXECUTE FUNCTION public.trigger_payroll_to_finance();

CREATE TRIGGER trg_leave_balance
AFTER UPDATE ON public.leaves
FOR EACH ROW EXECUTE FUNCTION public.trigger_leave_balance_update();

CREATE TRIGGER trg_tender_stage
BEFORE UPDATE ON public.tenders
FOR EACH ROW EXECUTE FUNCTION public.handle_tender_stage_change();

-- 8) updated_at triggers on core tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['employees','projects','clients','chart_of_accounts','companies',
    'leaves','employee_salaries','payroll_cycles','commissions','commission_rules',
    'tenders','bank_accounts','company_documents','departments','job_titles']
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name=t AND column_name='updated_at') THEN
      EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at()', t);
    END IF;
  END LOOP;
END $$;

-- 9) Salary journal entry rewritten against the real chart of accounts
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

  acc_expense := public.get_or_create_account(emp_company, '5100', 'مصروف الرواتب والأجور', 'expense', 'debit');
  acc_payable := public.get_or_create_account(emp_company, '2100', 'رواتب مستحقة الدفع', 'liability', 'credit');
  acc_gosi    := public.get_or_create_account(emp_company, '2200', 'التأمينات الاجتماعية المستحقة', 'liability', 'credit');

  INSERT INTO public.journal_entries (
    description, entry_date, reference_number, status, entry_type, company_id
  ) VALUES (
    'راتب الموظف ' || COALESCE(emp_name,'') || ' لشهر ' || to_char(salary_data.payment_date, 'YYYY-MM'),
    salary_data.payment_date,
    'SAL-' || COALESCE(emp_number, LEFT(emp_id::text,8)) || '-' || to_char(salary_data.payment_date, 'YYYYMM'),
    'posted', 'payroll', emp_company
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

-- 10) Callable setup for the signed-in user (company + role bootstrap)
CREATE OR REPLACE FUNCTION public.ensure_user_setup()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_uid uuid := auth.uid(); v_company uuid; v_count int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'غير مصرّح'; END IF;

  SELECT company_id INTO v_company FROM public.users_companies WHERE user_id = v_uid LIMIT 1;
  IF v_company IS NULL THEN
    SELECT id INTO v_company FROM public.companies WHERE is_active = true ORDER BY created_at LIMIT 1;
    IF v_company IS NULL THEN
      INSERT INTO public.companies (name, name_en, is_active)
      VALUES ('الشركة الرئيسية', 'Main Company', true) RETURNING id INTO v_company;
    END IF;
    INSERT INTO public.users_companies (user_id, company_id, is_default)
    VALUES (v_uid, v_company, true) ON CONFLICT DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid) THEN
    SELECT COUNT(*) INTO v_count FROM public.user_roles;
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (v_uid, v_company, CASE WHEN v_count = 0 THEN 'admin' ELSE 'viewer' END)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object('company_id', v_company);
END; $$;

REVOKE ALL ON FUNCTION public.ensure_user_setup() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_setup() TO authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_account(uuid,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_account(uuid,text,text,text,text) TO authenticated, service_role;
