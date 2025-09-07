-- حذف التبعيات CASCADE
DROP TRIGGER IF EXISTS capital_accounting_trigger ON public.capital_management CASCADE;
DROP TRIGGER IF EXISTS salary_accounting_trigger ON public.salary_records CASCADE;
DROP FUNCTION IF EXISTS public.update_accounting_transaction() CASCADE;

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