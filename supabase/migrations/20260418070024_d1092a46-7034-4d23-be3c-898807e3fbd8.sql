
-- ============================================
-- 1. TENDERS MODULE
-- ============================================
CREATE TYPE public.tender_stage AS ENUM (
  'lead', 'qualification', 'go_no_go', 'proposal', 'submitted', 'awarded', 'rejected', 'cancelled'
);

CREATE TABLE public.tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  tender_number text NOT NULL,
  title text NOT NULL,
  description text,
  client_id uuid,
  client_name text,
  stage public.tender_stage NOT NULL DEFAULT 'lead',
  estimated_value numeric(15,2) DEFAULT 0,
  contract_value numeric(15,2),
  currency text DEFAULT 'SAR',
  submission_deadline date,
  submission_date date,
  award_date date,
  proposed_pm_id uuid,
  assigned_to uuid,
  win_probability integer DEFAULT 50 CHECK (win_probability BETWEEN 0 AND 100),
  go_decision boolean,
  go_decision_notes text,
  rejection_reason text,
  project_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, tender_number)
);

CREATE INDEX idx_tenders_company ON public.tenders(company_id);
CREATE INDEX idx_tenders_stage ON public.tenders(stage);
CREATE INDEX idx_tenders_deadline ON public.tenders(submission_deadline);

ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenders_admin_all" ON public.tenders FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','owner','sales_manager','project_manager']))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','sales_manager','project_manager']));

CREATE POLICY "tenders_select_authenticated" ON public.tenders FOR SELECT TO authenticated USING (true);

-- Tender activities (audit log)
CREATE TABLE public.tender_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  from_stage public.tender_stage,
  to_stage public.tender_stage,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tender_activities_tender ON public.tender_activities(tender_id);

ALTER TABLE public.tender_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tender_activities_select" ON public.tender_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "tender_activities_insert" ON public.tender_activities FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger: log stage changes + auto-create project when awarded
CREATE OR REPLACE FUNCTION public.handle_tender_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.tender_activities (tender_id, activity_type, from_stage, to_stage, notes, created_by)
    VALUES (NEW.id, 'stage_change', OLD.stage, NEW.stage, NEW.go_decision_notes, auth.uid());

    -- Auto-create project on award
    IF NEW.stage = 'awarded' AND OLD.stage != 'awarded' AND NEW.project_id IS NULL THEN
      INSERT INTO public.projects (
        name, description, client_name, status, start_date,
        budget, contract_value, company_id, manager_id, created_by
      ) VALUES (
        NEW.title,
        COALESCE(NEW.description, 'Auto-created from tender ' || NEW.tender_number),
        NEW.client_name,
        'active',
        COALESCE(NEW.award_date, CURRENT_DATE),
        COALESCE(NEW.contract_value, NEW.estimated_value),
        COALESCE(NEW.contract_value, NEW.estimated_value),
        NEW.company_id,
        NEW.proposed_pm_id,
        auth.uid()
      ) RETURNING id INTO v_project_id;
      NEW.project_id := v_project_id;
      NEW.award_date := COALESCE(NEW.award_date, CURRENT_DATE);
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create projects table if missing (lightweight)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_id uuid,
  client_name text,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  budget numeric(15,2),
  contract_value numeric(15,2),
  actual_cost numeric(15,2) DEFAULT 0,
  company_id uuid,
  manager_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "projects_select_auth" ON public.projects FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "projects_admin_all" ON public.projects FOR ALL TO authenticated
    USING (has_any_role(auth.uid(), ARRAY['admin','owner','project_manager']))
    WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','project_manager']));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TRIGGER trg_tender_stage_change
  BEFORE UPDATE ON public.tenders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tender_stage_change();

-- ============================================
-- 2. COMMISSIONS MODULE
-- ============================================
CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('sales','collection','project')),
  calculation_type text NOT NULL CHECK (calculation_type IN ('fixed_percent','tiered','fixed_amount')),
  fixed_percent numeric(5,2),
  fixed_amount numeric(15,2),
  tiers jsonb DEFAULT '[]'::jsonb,
  applies_to_role text,
  applies_to_employee_id uuid,
  trigger_event text NOT NULL DEFAULT 'payment_collected' CHECK (trigger_event IN ('payment_collected','project_completed','sale_closed')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_rules_admin" ON public.commission_rules FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager']))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager']));

CREATE POLICY "commission_rules_select" ON public.commission_rules FOR SELECT TO authenticated USING (true);

CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  commission_rule_id uuid REFERENCES public.commission_rules(id),
  rule_type text NOT NULL,
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  base_amount numeric(15,2) NOT NULL,
  commission_amount numeric(15,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','cancelled')),
  triggered_by_event text,
  collection_date date,
  approval_date date,
  paid_date date,
  approved_by uuid,
  journal_entry_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_commissions_employee ON public.commissions(employee_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_reference ON public.commissions(reference_type, reference_id);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commissions_finance_all" ON public.commissions FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager','hr_manager']))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager','hr_manager']));

CREATE POLICY "commissions_employee_view_own" ON public.commissions FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM public.employees WHERE created_by = auth.uid())
    OR has_any_role(auth.uid(), ARRAY['admin','owner','finance_manager','hr_manager'])
  );

-- ============================================
-- 3. NOTIFICATION LOGS
-- ============================================
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  recipient_user_id uuid,
  recipient_employee_id uuid,
  recipient_email text,
  recipient_phone text,
  channel text NOT NULL CHECK (channel IN ('email','whatsapp','sms','in_app')),
  notification_type text NOT NULL,
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','delivered','read')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  reference_type text,
  reference_id uuid,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_logs_recipient ON public.notification_logs(recipient_user_id);
CREATE INDEX idx_notif_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notif_logs_created ON public.notification_logs(created_at DESC);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_logs_select_own" ON public.notification_logs FOR SELECT TO authenticated
  USING (
    recipient_user_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager'])
  );

CREATE POLICY "notif_logs_insert_system" ON public.notification_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notif_logs_update_admin" ON public.notification_logs FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

-- ============================================
-- 4. ATTENDANCE AUTOMATION SETTINGS
-- ============================================
CREATE TABLE public.attendance_automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  late_threshold_minutes integer NOT NULL DEFAULT 15,
  late_alert_enabled boolean NOT NULL DEFAULT true,
  absence_day1_enabled boolean NOT NULL DEFAULT true,
  absence_day2_enabled boolean NOT NULL DEFAULT true,
  absence_day3_enabled boolean NOT NULL DEFAULT true,
  channels text[] NOT NULL DEFAULT ARRAY['email','in_app']::text[],
  late_template text NOT NULL DEFAULT 'مرحباً {name}، لاحظنا تأخرك اليوم. نتمنى أن يكون كل شيء على ما يرام. يرجى إعلامنا بالسبب.',
  absence_day1_template text NOT NULL DEFAULT 'مرحباً {name}، لاحظنا غيابك اليوم. نأمل أن تكون بخير. يرجى التواصل معنا.',
  absence_day2_template text NOT NULL DEFAULT 'إشعار رسمي: غياب اليوم الثاني للموظف {name}. يرجى تقديم مبرر رسمي.',
  absence_day3_template text NOT NULL DEFAULT 'إنذار: غياب لـ 3 أيام متتالية. يجب تعبئة نموذج الغياب فوراً.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "att_auto_admin" ON public.attendance_automation_settings FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

CREATE POLICY "att_auto_select" ON public.attendance_automation_settings FOR SELECT TO authenticated USING (true);

-- updated_at triggers
CREATE TRIGGER trg_tenders_updated BEFORE UPDATE ON public.tenders FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER trg_commission_rules_updated BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER trg_commissions_updated BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER trg_att_auto_updated BEFORE UPDATE ON public.attendance_automation_settings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
