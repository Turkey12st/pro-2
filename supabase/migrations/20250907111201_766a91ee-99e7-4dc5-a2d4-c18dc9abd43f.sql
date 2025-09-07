-- إنشاء جدول salary_records لحفظ سجلات الرواتب
CREATE TABLE IF NOT EXISTS public.salary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  housing_allowance NUMERIC NOT NULL DEFAULT 0,
  transportation_allowance NUMERIC NOT NULL DEFAULT 0,
  other_allowances NUMERIC NOT NULL DEFAULT 0,
  total_salary NUMERIC NOT NULL DEFAULT 0,
  gosi_subscription NUMERIC NOT NULL DEFAULT 0,
  other_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id)
);

-- تمكين RLS على جدول salary_records
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الوصول للرواتب
CREATE POLICY "HR staff can manage salary records" 
ON public.salary_records 
FOR ALL 
USING (has_role('admin'::text) OR has_role('owner'::text) OR has_role('hr_manager'::text));

-- إضافة بيانات تجريبية لسجلات الرواتب
INSERT INTO public.salary_records (employee_id, payment_date, basic_salary, housing_allowance, transportation_allowance, total_salary, gosi_subscription, net_salary, status, created_by)
SELECT 
  e.id,
  '2024-01-01'::date,
  e.salary * 0.6,
  e.salary * 0.25,
  e.salary * 0.15,
  e.salary,
  e.salary * 0.095,
  e.salary * 0.905,
  'paid',
  '00000000-0000-0000-0000-000000000000'
FROM public.employees e
ON CONFLICT DO NOTHING;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON public.salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_payment_date ON public.salary_records(payment_date);