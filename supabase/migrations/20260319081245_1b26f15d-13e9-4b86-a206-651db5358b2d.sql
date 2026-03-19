
-- Fix attendance_records RLS for admins
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance_records;
CREATE POLICY "Admins can manage attendance" ON public.attendance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );

DROP POLICY IF EXISTS "Authenticated can read attendance" ON public.attendance_records;
CREATE POLICY "Authenticated can read attendance" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (true);

-- Fix employee_benefits RLS
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage benefits" ON public.employee_benefits;
CREATE POLICY "Admins can manage benefits" ON public.employee_benefits
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );

-- Fix employee_violations RLS
ALTER TABLE public.employee_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage violations" ON public.employee_violations;
CREATE POLICY "Admins can manage violations" ON public.employee_violations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );

-- Fix employee_salaries RLS
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage salaries" ON public.employee_salaries;
CREATE POLICY "Admins can manage salaries" ON public.employee_salaries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );

-- Fix alert_logs RLS
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alert_logs;
CREATE POLICY "Admins can manage alerts" ON public.alert_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );
