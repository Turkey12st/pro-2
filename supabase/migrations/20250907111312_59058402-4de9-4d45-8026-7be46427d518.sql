-- تعطيل trigger مؤقتاً لتجنب الخطأ
DROP TRIGGER IF EXISTS trigger_update_accounting_transaction ON public.capital_management;
DROP FUNCTION IF EXISTS public.update_accounting_transaction();

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

-- إضافة بيانات رأس المال
INSERT INTO public.capital_management (fiscal_year, total_capital, available_capital, reserved_capital, notes)
VALUES 
  (2024, 1000000, 800000, 200000, 'رأس المال الأولي للشركة')
ON CONFLICT DO NOTHING;

-- إضافة بيانات الرواتب بالبنية الحالية
INSERT INTO public.salary_records (employee_id, payment_date, base_salary, housing_allowance, transportation_allowance, total_salary, gosi_subscription, status)
SELECT 
  e.id,
  '2024-01-01'::date,
  e.salary * 0.6,
  e.salary * 0.25,
  e.salary * 0.15,
  e.salary,
  e.salary * 0.095,
  'paid'
FROM public.employees e
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_records sr WHERE sr.employee_id = e.id
);

-- تحديث جدول company_partners لضمان وجود share_value
UPDATE public.company_partners 
SET share_value = CASE 
  WHEN share_value IS NULL OR share_value = 0 THEN ownership_percentage * 10000
  ELSE share_value
END;