-- Phase 1: Critical Database Security Fixes

-- Create security definer function to get user role (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- Enable RLS on tables that don't have it
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles (admin-only access)
CREATE POLICY "Only admins can view user roles" ON public.user_roles
FOR SELECT USING (public.has_role('admin') OR public.has_role('owner'));

CREATE POLICY "Only admins can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (public.has_role('admin') OR public.has_role('owner'));

CREATE POLICY "Only admins can update user roles" ON public.user_roles
FOR UPDATE USING (public.has_role('admin') OR public.has_role('owner'));

CREATE POLICY "Only admins can delete user roles" ON public.user_roles
FOR DELETE USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for email_settings (admin-only)
CREATE POLICY "Only admins can manage email settings" ON public.email_settings
FOR ALL USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for government_integration (admin-only)
CREATE POLICY "Only admins can manage government integration" ON public.government_integration
FOR ALL USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for hr_regulations (admin-only)
CREATE POLICY "Only admins can manage HR regulations" ON public.hr_regulations
FOR ALL USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for bank_integration (admin-only)
CREATE POLICY "Only admins can manage bank integration" ON public.bank_integration
FOR ALL USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for chart_of_accounts (authenticated users can read, admins can modify)
CREATE POLICY "Users can view chart of accounts" ON public.chart_of_accounts
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify chart of accounts" ON public.chart_of_accounts
FOR INSERT WITH CHECK (public.has_role('admin') OR public.has_role('owner'));

CREATE POLICY "Only admins can update chart of accounts" ON public.chart_of_accounts
FOR UPDATE USING (public.has_role('admin') OR public.has_role('owner'));

CREATE POLICY "Only admins can delete chart of accounts" ON public.chart_of_accounts
FOR DELETE USING (public.has_role('admin') OR public.has_role('owner'));

-- Create RLS policies for employee_violations (HR managers and admins)
CREATE POLICY "HR staff can view employee violations" ON public.employee_violations
FOR SELECT USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

CREATE POLICY "HR staff can insert employee violations" ON public.employee_violations
FOR INSERT WITH CHECK (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

CREATE POLICY "HR staff can update employee violations" ON public.employee_violations
FOR UPDATE USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

-- Create RLS policies for attendance_records (HR staff and employees can view their own)
CREATE POLICY "Users can view their own attendance" ON public.attendance_records
FOR SELECT USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE created_by = auth.uid()
  ) OR
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

CREATE POLICY "HR staff can manage attendance records" ON public.attendance_records
FOR ALL USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

-- Create RLS policies for salary_deductions (HR staff only)
CREATE POLICY "HR staff can manage salary deductions" ON public.salary_deductions
FOR ALL USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

-- Create RLS policies for employee_benefits (HR staff only)
CREATE POLICY "HR staff can manage employee benefits" ON public.employee_benefits
FOR ALL USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('hr_manager')
);

-- Create RLS policies for project_invoices (project managers and admins)
CREATE POLICY "Project managers can view invoices" ON public.project_invoices
FOR SELECT USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('project_manager') OR
  public.has_role('view_financials')
);

CREATE POLICY "Admins can manage invoices" ON public.project_invoices
FOR ALL USING (
  public.has_role('admin') OR 
  public.has_role('owner')
);

-- Create RLS policies for accounting_transactions (financial staff only)
CREATE POLICY "Financial staff can view accounting transactions" ON public.accounting_transactions
FOR SELECT USING (
  public.has_role('admin') OR 
  public.has_role('owner') OR 
  public.has_role('view_financials')
);

CREATE POLICY "Admins can manage accounting transactions" ON public.accounting_transactions
FOR ALL USING (
  public.has_role('admin') OR 
  public.has_role('owner')
);

-- Create RLS policies for alert_logs (admin-only for management, read for relevant users)
CREATE POLICY "Users can view relevant alert logs" ON public.alert_logs
FOR SELECT USING (
  public.has_role('admin') OR 
  public.has_role('owner')
);

CREATE POLICY "System can insert alert logs" ON public.alert_logs
FOR INSERT WITH CHECK (true);

-- Secure all database functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_company_name(p_company_id uuid, p_new_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.company_info
  SET name = p_new_name
  WHERE id = p_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_company_information(p_company_id uuid, p_unified_national_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.company_info
  SET "Unified National Number" = p_unified_national_number
  WHERE id = p_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_journal_entries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  entry_count integer;
BEGIN
  SELECT COUNT(*) INTO entry_count
  FROM public.journal_entries;
  RETURN entry_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_journal_entry_attachment(p_entry_id uuid, p_attachment_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.journal_entries
  SET attachment_url = p_attachment_url
  WHERE id = p_entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_journal_entries()
RETURNS TABLE(id uuid, title text, content text, attachment_url text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT je.id, je.description as title, je.description as content, je.attachment_url
  FROM public.journal_entries je;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unified_national_number(company_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  national_number text;
BEGIN
  SELECT "Unified National Number" INTO national_number
  FROM public.company_info
  WHERE id = company_id;
  RETURN national_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_journal_entry_attachment(p_entry_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.journal_entries
  SET attachment_url = NULL
  WHERE id = p_entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_journal_entry_attachment(p_entry_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_attachment_url TEXT;
BEGIN
  SELECT attachment_url INTO v_attachment_url
  FROM public.journal_entries
  WHERE id = p_entry_id;
  RETURN v_attachment_url;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_salary_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  journal_id uuid;
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    journal_id := public.create_salary_journal_entry(NEW.employee_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Update remaining functions with security definer
CREATE OR REPLACE FUNCTION public.setup_new_employee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM public.create_employee_accounts(NEW.id, NEW.name);
  
  INSERT INTO public.employee_performance (
    employee_id, evaluation_period, performance_score,
    goals_achieved, total_goals, attendance_rate
  ) VALUES (
    NEW.id, 'تقييم أولي', 75, 0, 0, 100
  );

  RETURN NEW;
END;
$$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log
FOR SELECT USING (public.has_role('admin') OR public.has_role('owner'));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();