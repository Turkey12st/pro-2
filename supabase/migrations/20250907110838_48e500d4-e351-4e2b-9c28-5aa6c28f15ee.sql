-- إنشاء جدول salary_records لحفظ سجلات الرواتب
CREATE TABLE IF NOT EXISTS public.salary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  salary_month DATE NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  housing_allowance NUMERIC NOT NULL DEFAULT 0,
  transportation_allowance NUMERIC NOT NULL DEFAULT 0,
  other_allowances NUMERIC NOT NULL DEFAULT 0,
  total_salary NUMERIC NOT NULL DEFAULT 0,
  gosi_subscription NUMERIC NOT NULL DEFAULT 0,
  other_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE,
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

-- إنشاء جدول capital_management لإدارة رأس المال
CREATE TABLE IF NOT EXISTS public.capital_management (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fiscal_year INTEGER NOT NULL,
  total_capital NUMERIC NOT NULL DEFAULT 0,
  available_capital NUMERIC NOT NULL DEFAULT 0,
  reserved_capital NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  turnover_rate NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- تمكين RLS على جدول capital_management
ALTER TABLE public.capital_management ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الوصول لرأس المال
CREATE POLICY "Admins can manage capital" 
ON public.capital_management 
FOR ALL 
USING (has_role('admin'::text) OR has_role('owner'::text));

CREATE POLICY "Financial staff can view capital" 
ON public.capital_management 
FOR SELECT 
USING (has_role('admin'::text) OR has_role('owner'::text) OR has_role('view_financials'::text));

-- إضافة بيانات تجريبية لسجلات الرواتب
INSERT INTO public.salary_records (employee_id, salary_month, basic_salary, housing_allowance, transportation_allowance, total_salary, gosi_subscription, net_salary, status, created_by)
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

-- إضافة بيانات رأس المال
INSERT INTO public.capital_management (fiscal_year, total_capital, available_capital, reserved_capital, notes)
VALUES 
  (2024, 1000000, 800000, 200000, 'رأس المال الأولي للشركة')
ON CONFLICT DO NOTHING;

-- تحديث جدول company_partners لضمان وجود share_value
UPDATE public.company_partners 
SET share_value = CASE 
  WHEN share_value IS NULL OR share_value = 0 THEN ownership_percentage * 10000
  ELSE share_value
END;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_salary_records_employee_id ON public.salary_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_salary_month ON public.salary_records(salary_month);
CREATE INDEX IF NOT EXISTS idx_capital_management_fiscal_year ON public.capital_management(fiscal_year);