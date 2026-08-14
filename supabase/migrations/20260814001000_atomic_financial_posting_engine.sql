-- Atomic financial posting engine.
-- This migration is intentionally additive for historical records and enforces the new rules
-- for all journal entries created or posted after deployment.

CREATE TABLE IF NOT EXISTS public.accounting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  accounting_event text NOT NULL,
  idempotency_key uuid NOT NULL,
  request_hash text NOT NULL,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('processing', 'draft', 'posted', 'failed', 'reversed')),
  journal_entry_id uuid UNIQUE REFERENCES public.journal_entries(id),
  failure_code text,
  failure_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (company_id, idempotency_key),
  UNIQUE (company_id, source_type, source_id, accounting_event)
);

CREATE OR REPLACE FUNCTION public.can_access_company_finance(_company uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _company IS NOT NULL
     AND public.has_any_company_role(
       auth.uid(),
       _company,
       ARRAY['admin', 'owner', 'accountant']::public.app_role[]
     );
$$;

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_id uuid,
  ADD COLUMN IF NOT EXISTS accounting_event text,
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS reversal_of_journal_entry_id uuid REFERENCES public.journal_entries(id);

CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_source_event_unique
  ON public.journal_entries (company_id, source_type, source_id, accounting_event)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL AND accounting_event IS NOT NULL;

CREATE INDEX IF NOT EXISTS accounting_events_company_status_idx
  ON public.accounting_events (company_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS journal_entries_company_status_date_idx
  ON public.journal_entries (company_id, status, entry_date DESC);

ALTER TABLE public.journal_entry_items
  DROP CONSTRAINT IF EXISTS journal_item_one_sided_positive_chk;

ALTER TABLE public.journal_entry_items
  ADD CONSTRAINT journal_item_one_sided_positive_chk CHECK (
    (COALESCE(debit, 0) > 0 AND COALESCE(credit, 0) = 0)
    OR
    (COALESCE(credit, 0) > 0 AND COALESCE(debit, 0) = 0)
  ) NOT VALID;

CREATE OR REPLACE FUNCTION public.assert_journal_item_account_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_account_company_id uuid;
  v_account_is_active boolean;
BEGIN
  SELECT company_id
    INTO v_company_id
  FROM public.journal_entries
  WHERE id = NEW.journal_entry_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'لا يمكن إضافة بند لقيد بلا شركة محددة';
  END IF;

  SELECT company_id, is_active
    INTO v_account_company_id, v_account_is_active
  FROM public.chart_of_accounts
  WHERE id = NEW.account_id;

  IF NOT FOUND OR NOT COALESCE(v_account_is_active, false) THEN
    RAISE EXCEPTION 'الحساب المحاسبي غير موجود أو غير نشط';
  END IF;

  IF v_account_company_id IS NOT NULL AND v_account_company_id <> v_company_id THEN
    RAISE EXCEPTION 'لا يمكن استخدام حساب تابع لشركة أخرى';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_posted_entry_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_debit numeric := 0;
  v_total_credit numeric := 0;
  v_line_count integer := 0;
BEGIN
  IF NEW.status = 'posted' AND (TG_OP = 'INSERT' OR COALESCE(OLD.status, '') <> 'posted') THEN
    SELECT
      COALESCE(SUM(debit), 0),
      COALESCE(SUM(credit), 0),
      COUNT(*)
    INTO v_total_debit, v_total_credit, v_line_count
    FROM public.journal_entry_items
    WHERE journal_entry_id = NEW.id;

    IF v_line_count < 2 THEN
      RAISE EXCEPTION 'لا يمكن ترحيل قيد يحتوي على أقل من بندين';
    END IF;

    IF ABS(v_total_debit - v_total_credit) > 0.009 THEN
      RAISE EXCEPTION 'القيد غير متوازن: المدين % لا يساوي الدائن %', v_total_debit, v_total_credit;
    END IF;

    NEW.total_debit := v_total_debit;
    NEW.total_credit := v_total_credit;
    NEW.posted_at := COALESCE(NEW.posted_at, now());
    NEW.posted_by := COALESCE(NEW.posted_by, auth.uid());
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_posted_journal_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'posted' THEN
    RAISE EXCEPTION 'لا يمكن حذف قيد مرحل؛ استخدم قيداً عكسياً';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'posted' THEN
    RAISE EXCEPTION 'لا يمكن تعديل قيد مرحل؛ استخدم قيداً عكسياً أو تصحيحياً';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_posted_journal_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_entry_id uuid;
  v_new_entry_id uuid;
BEGIN
  v_old_entry_id := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN OLD.journal_entry_id ELSE NULL END;
  v_new_entry_id := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.journal_entry_id ELSE NULL END;

  IF v_old_entry_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.journal_entries WHERE id = v_old_entry_id AND status = 'posted'
  ) THEN
    RAISE EXCEPTION 'لا يمكن تعديل أو حذف بند تابع لقيد مرحل';
  END IF;

  IF v_new_entry_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.journal_entries WHERE id = v_new_entry_id AND status = 'posted'
  ) THEN
    RAISE EXCEPTION 'لا يمكن إضافة بند إلى قيد مرحل';
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS trg_assert_journal_item_account_scope ON public.journal_entry_items;
CREATE TRIGGER trg_assert_journal_item_account_scope
BEFORE INSERT OR UPDATE OF journal_entry_id, account_id ON public.journal_entry_items
FOR EACH ROW EXECUTE FUNCTION public.assert_journal_item_account_scope();

DROP TRIGGER IF EXISTS trg_je_balance_on_post ON public.journal_entries;
CREATE TRIGGER trg_je_balance_on_post
BEFORE INSERT OR UPDATE OF status ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_posted_entry_balance();

DROP TRIGGER IF EXISTS trg_protect_posted_journal_entries ON public.journal_entries;
CREATE TRIGGER trg_protect_posted_journal_entries
BEFORE UPDATE OR DELETE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_journal_entry();

DROP TRIGGER IF EXISTS trg_protect_posted_journal_items ON public.journal_entry_items;
CREATE TRIGGER trg_protect_posted_journal_items
BEFORE INSERT OR UPDATE OR DELETE ON public.journal_entry_items
FOR EACH ROW EXECUTE FUNCTION public.protect_posted_journal_item();

CREATE OR REPLACE FUNCTION public.create_accounting_event(
  p_company_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_accounting_event text,
  p_entry_date date,
  p_description text,
  p_currency text,
  p_idempotency_key uuid,
  p_lines jsonb,
  p_auto_post boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_event public.accounting_events%ROWTYPE;
  v_journal_entry_id uuid;
  v_total_debit numeric := 0;
  v_total_credit numeric := 0;
  v_line_count integer := 0;
  v_request_hash text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'المصادقة مطلوبة';
  END IF;

  IF p_company_id IS NULL OR p_source_type IS NULL OR btrim(p_source_type) = ''
     OR p_source_id IS NULL OR p_accounting_event IS NULL OR btrim(p_accounting_event) = ''
     OR p_entry_date IS NULL OR p_description IS NULL OR btrim(p_description) = ''
     OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'بيانات الحدث المحاسبي غير مكتملة';
  END IF;

  IF jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) < 2 THEN
    RAISE EXCEPTION 'يجب أن يحتوي القيد على بندين محاسبيين على الأقل';
  END IF;

  IF NOT public.can_access_company_finance(p_company_id) THEN
    RAISE EXCEPTION 'لا تملك صلاحية إنشاء قيد مالي لهذه الشركة';
  END IF;

  v_request_hash := md5(
    jsonb_build_object(
      'company_id', p_company_id,
      'source_type', p_source_type,
      'source_id', p_source_id,
      'accounting_event', p_accounting_event,
      'entry_date', p_entry_date,
      'description', p_description,
      'currency', COALESCE(p_currency, 'SAR'),
      'lines', p_lines,
      'auto_post', p_auto_post
    )::text
  );

  INSERT INTO public.accounting_events (
    company_id,
    source_type,
    source_id,
    accounting_event,
    idempotency_key,
    request_hash,
    requested_by,
    status
  ) VALUES (
    p_company_id,
    p_source_type,
    p_source_id,
    p_accounting_event,
    p_idempotency_key,
    v_request_hash,
    v_user_id,
    'processing'
  ) ON CONFLICT DO NOTHING
  RETURNING * INTO v_event;

  IF v_event.id IS NULL THEN
    SELECT *
      INTO v_event
    FROM public.accounting_events
    WHERE company_id = p_company_id
      AND (
        idempotency_key = p_idempotency_key
        OR (source_type = p_source_type AND source_id = p_source_id AND accounting_event = p_accounting_event)
      )
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE;

    IF v_event.request_hash <> v_request_hash THEN
      RAISE EXCEPTION 'لا يمكن إعادة استخدام مفتاح التكرار أو المصدر مع بيانات مختلفة';
    END IF;

    IF v_event.status IN ('draft', 'posted') AND v_event.journal_entry_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'event_id', v_event.id,
        'journal_entry_id', v_event.journal_entry_id,
        'status', v_event.status,
        'reused', true
      );
    END IF;

    RAISE EXCEPTION 'الحدث المحاسبي قيد المعالجة؛ أعد المحاولة لاحقاً';
  END IF;

  WITH parsed_lines AS (
    SELECT *
    FROM jsonb_to_recordset(p_lines) AS x(
      account_id uuid,
      description text,
      debit numeric,
      credit numeric,
      currency text,
      exchange_rate numeric,
      tax_amount numeric,
      tax_code text,
      dimension1 text,
      dimension2 text
    )
  )
  SELECT
    COALESCE(SUM(COALESCE(debit, 0)), 0),
    COALESCE(SUM(COALESCE(credit, 0)), 0),
    COUNT(*)
  INTO v_total_debit, v_total_credit, v_line_count
  FROM parsed_lines;

  IF v_line_count < 2 OR ABS(v_total_debit - v_total_credit) > 0.009 THEN
    RAISE EXCEPTION 'بنود القيد غير متوازنة';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_lines) AS x(account_id uuid, debit numeric, credit numeric)
    WHERE account_id IS NULL
       OR (COALESCE(debit, 0) <= 0 AND COALESCE(credit, 0) <= 0)
       OR (COALESCE(debit, 0) > 0 AND COALESCE(credit, 0) > 0)
  ) THEN
    RAISE EXCEPTION 'يتضمن القيد بنوداً غير صالحة';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_lines) AS x(account_id uuid)
    LEFT JOIN public.chart_of_accounts coa ON coa.id = x.account_id
    WHERE coa.id IS NULL
       OR NOT COALESCE(coa.is_active, false)
       OR (coa.company_id IS NOT NULL AND coa.company_id <> p_company_id)
  ) THEN
    RAISE EXCEPTION 'يتضمن القيد حساباً غير نشط أو تابعاً لشركة أخرى';
  END IF;

  INSERT INTO public.journal_entries (
    entry_date,
    description,
    reference_number,
    status,
    total_debit,
    total_credit,
    created_by,
    entry_name,
    entry_type,
    currency,
    company_id,
    source_type,
    source_id,
    accounting_event,
    idempotency_key
  ) VALUES (
    p_entry_date,
    p_description,
    upper(left(p_source_type, 12)) || '-' || left(p_source_id::text, 8),
    'draft',
    v_total_debit,
    v_total_credit,
    v_user_id,
    p_description,
    p_accounting_event,
    COALESCE(NULLIF(btrim(p_currency), ''), 'SAR'),
    p_company_id,
    p_source_type,
    p_source_id,
    p_accounting_event,
    p_idempotency_key
  ) RETURNING id INTO v_journal_entry_id;

  INSERT INTO public.journal_entry_items (
    journal_entry_id,
    account_id,
    description,
    debit,
    credit,
    currency,
    exchange_rate,
    tax_amount,
    tax_code,
    dimension1,
    dimension2
  )
  SELECT
    v_journal_entry_id,
    x.account_id,
    NULLIF(btrim(x.description), ''),
    COALESCE(x.debit, 0),
    COALESCE(x.credit, 0),
    COALESCE(NULLIF(btrim(x.currency), ''), COALESCE(NULLIF(btrim(p_currency), ''), 'SAR')),
    COALESCE(x.exchange_rate, 1),
    COALESCE(x.tax_amount, 0),
    x.tax_code,
    x.dimension1,
    x.dimension2
  FROM jsonb_to_recordset(p_lines) AS x(
    account_id uuid,
    description text,
    debit numeric,
    credit numeric,
    currency text,
    exchange_rate numeric,
    tax_amount numeric,
    tax_code text,
    dimension1 text,
    dimension2 text
  );

  IF p_auto_post THEN
    UPDATE public.journal_entries
    SET status = 'posted',
        posted_by = v_user_id,
        posted_at = now(),
        is_approved = true,
        approved_by = v_user_id,
        approved_at = now()
    WHERE id = v_journal_entry_id;
  END IF;

  UPDATE public.accounting_events
  SET journal_entry_id = v_journal_entry_id,
      status = CASE WHEN p_auto_post THEN 'posted' ELSE 'draft' END,
      processed_at = now()
  WHERE id = v_event.id;

  INSERT INTO public.audit_trail (
    company_id,
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data
  ) VALUES (
    p_company_id,
    v_user_id,
    'journal_entries',
    v_journal_entry_id::text,
    CASE WHEN p_auto_post THEN 'POST' ELSE 'CREATE_DRAFT' END,
    NULL,
    jsonb_build_object(
      'accounting_event_id', v_event.id,
      'source_type', p_source_type,
      'source_id', p_source_id,
      'accounting_event', p_accounting_event,
      'total_debit', v_total_debit,
      'total_credit', v_total_credit
    )
  );

  RETURN jsonb_build_object(
    'event_id', v_event.id,
    'journal_entry_id', v_journal_entry_id,
    'status', CASE WHEN p_auto_post THEN 'posted' ELSE 'draft' END,
    'reused', false
  );
END;
$$;

ALTER TABLE public.accounting_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accounting_events_select_finance ON public.accounting_events;
CREATE POLICY accounting_events_select_finance
ON public.accounting_events
FOR SELECT TO authenticated
USING (public.can_access_company_finance(company_id));

DROP POLICY IF EXISTS "System can insert audit" ON public.audit_trail;

REVOKE ALL ON FUNCTION public.assert_journal_item_account_scope() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.enforce_posted_entry_balance() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.protect_posted_journal_entry() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.protect_posted_journal_item() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_accounting_event(uuid, text, uuid, text, date, text, text, uuid, jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_accounting_event(uuid, text, uuid, text, date, text, text, uuid, jsonb, boolean) TO authenticated, service_role;
