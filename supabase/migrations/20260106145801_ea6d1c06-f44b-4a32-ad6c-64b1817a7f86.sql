-- تفعيل RLS على الجداول المكشوفة
ALTER TABLE IF EXISTS public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vacation_balance ENABLE ROW LEVEL SECURITY;

-- إنشاء دالة التحقق من الدور (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- إنشاء دالة للتحقق من أدوار متعددة
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- سياسات vacation_requests
DROP POLICY IF EXISTS "HR staff can manage vacation requests" ON public.vacation_requests;
DROP POLICY IF EXISTS "Employees can view their own vacation requests" ON public.vacation_requests;
DROP POLICY IF EXISTS "Employees can view own vacation requests" ON public.vacation_requests;

CREATE POLICY "HR staff can manage vacation requests"
ON public.vacation_requests FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'hr_manager']));

CREATE POLICY "Employees can view own vacation requests"
ON public.vacation_requests FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE created_by = auth.uid()
  )
);

-- سياسات vacation_balance
DROP POLICY IF EXISTS "HR staff can manage vacation balance" ON public.vacation_balance;
DROP POLICY IF EXISTS "Employees can view own vacation balance" ON public.vacation_balance;

CREATE POLICY "HR staff can manage vacation balance"
ON public.vacation_balance FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'owner', 'hr_manager']));

CREATE POLICY "Employees can view own vacation balance"
ON public.vacation_balance FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE created_by = auth.uid()
  )
);

-- تحسين سياسات clients
DROP POLICY IF EXISTS "Users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Sales staff can view clients" ON public.clients;
DROP POLICY IF EXISTS "Staff can view clients" ON public.clients;

CREATE POLICY "Admins can manage all clients"
ON public.clients FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'owner']));

CREATE POLICY "Staff can view clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['finance_manager', 'project_manager', 'hr_manager']));

-- إنشاء جدول سجل الأمان
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;

CREATE POLICY "Admins can view security logs"
ON public.security_audit_log FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'owner']));

CREATE POLICY "System can insert security logs"
ON public.security_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);