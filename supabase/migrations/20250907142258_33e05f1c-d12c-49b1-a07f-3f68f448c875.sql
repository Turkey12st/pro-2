-- إنشاء جداول نظام HR المتقدم

-- جدول بيانات التأمينات الاجتماعية
CREATE TABLE IF NOT EXISTS public.gosi_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  gosi_number TEXT,
  subscription_date DATE,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  api_response JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول بيانات الحضور المتقدمة
CREATE TABLE IF NOT EXISTS public.attendance_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  upload_date DATE DEFAULT CURRENT_DATE,
  processed BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول المزايا القابلة للتحكم
CREATE TABLE IF NOT EXISTS public.employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,
  benefit_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول أنواع المخالفات حسب نظام العمل السعودي
CREATE TABLE IF NOT EXISTS public.violation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  violation_name TEXT NOT NULL,
  severity_level INTEGER DEFAULT 1, -- 1=خفيف، 2=متوسط، 3=شديد
  first_violation_penalty TEXT,
  second_violation_penalty TEXT,
  third_violation_penalty TEXT,
  deduction_percentage NUMERIC DEFAULT 0,
  legal_reference TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- إدراج بيانات المخالفات حسب نظام العمل السعودي
INSERT INTO public.violation_types (category, violation_name, severity_level, first_violation_penalty, second_violation_penalty, third_violation_penalty, deduction_percentage, legal_reference) VALUES
('الحضور والانصراف', 'التأخر عن العمل', 1, 'إنذار شفهي', 'إنذار كتابي', 'خصم يوم', 0, 'المادة 66 من نظام العمل'),
('الحضور والانصراف', 'الغياب بدون عذر', 2, 'خصم يوم', 'خصم يومين', 'إنذار نهائي', 100, 'المادة 66 من نظام العمل'),
('الحضور والانصراف', 'ترك العمل دون إذن', 3, 'خصم يوم', 'خصم ثلاثة أيام', 'فصل', 100, 'المادة 80 من نظام العمل'),
('السلوك المهني', 'عدم احترام الزملاء', 2, 'إنذار كتابي', 'خصم يوم', 'إنذار نهائي', 0, 'المادة 80 من نظام العمل'),
('السلوك المهني', 'إفشاء أسرار العمل', 3, 'إنذار نهائي', 'فصل', 'فصل', 0, 'المادة 80 من نظام العمل'),
('الأداء الوظيفي', 'عدم أداء الواجبات', 2, 'إنذار كتابي', 'خصم يوم', 'خصم ثلاثة أيام', 0, 'المادة 80 من نظام العمل'),
('الأداء الوظيفي', 'إهمال أدوات العمل', 1, 'إنذار شفهي', 'إنذار كتابي', 'خصم يوم', 0, 'المادة 80 من نظام العمل'),
('السلامة', 'عدم اتباع تعليمات السلامة', 3, 'إنذار كتابي', 'خصم يوم', 'فصل', 0, 'المادة 80 من نظام العمل');

-- جدول رصيد الإجازات
CREATE TABLE IF NOT EXISTS public.vacation_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
  annual_days_total NUMERIC DEFAULT 21, -- 21 يوم سنوياً حسب النظام السعودي
  annual_days_used NUMERIC DEFAULT 0,
  annual_days_remaining NUMERIC DEFAULT 21,
  sick_days_total NUMERIC DEFAULT 30, -- 30 يوم مرضية سنوياً
  sick_days_used NUMERIC DEFAULT 0,
  sick_days_remaining NUMERIC DEFAULT 30,
  emergency_days_total NUMERIC DEFAULT 5, -- 5 أيام اضطرارية
  emergency_days_used NUMERIC DEFAULT 0,
  emergency_days_remaining NUMERIC DEFAULT 5,
  last_calculation_date DATE DEFAULT CURRENT_DATE,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول طلبات الإجازات
CREATE TABLE IF NOT EXISTS public.vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  vacation_type TEXT NOT NULL, -- سنوية، مرضية، اضطرارية، أمومة، إلخ
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID,
  approved_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول إدارة رأس المال المتقدم
CREATE TABLE IF NOT EXISTS public.capital_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type TEXT NOT NULL, -- increase, decrease
  amount NUMERIC NOT NULL,
  movement_date DATE DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  description TEXT,
  approved_by UUID,
  documents JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- تحديث جدول capital_management لإضافة التاريخ
ALTER TABLE public.capital_management 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_movement_date DATE DEFAULT CURRENT_DATE;

-- جدول توزيع رأس المال على الشركاء
CREATE TABLE IF NOT EXISTS public.partner_capital_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  ownership_percentage NUMERIC NOT NULL,
  capital_amount NUMERIC NOT NULL,
  share_count INTEGER DEFAULT 1,
  calculation_date DATE DEFAULT CURRENT_DATE,
  fiscal_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- جدول تحديث رواتب متقدم
ALTER TABLE public.salary_records 
ADD COLUMN IF NOT EXISTS allowances JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS deductions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payslip_url TEXT;

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.gosi_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_capital_distribution ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "HR staff can manage GOSI integration" ON public.gosi_integration
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

CREATE POLICY "HR staff can manage attendance files" ON public.attendance_files
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

CREATE POLICY "HR staff can manage employee benefits" ON public.employee_benefits
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

CREATE POLICY "Everyone can view violation types" ON public.violation_types
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage violation types" ON public.violation_types
FOR ALL USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "HR staff can manage vacation balance" ON public.vacation_balance
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

CREATE POLICY "HR staff can manage vacation requests" ON public.vacation_requests
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

CREATE POLICY "Admins can manage capital movements" ON public.capital_movements
FOR ALL USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "Admins can view partner capital distribution" ON public.partner_capital_distribution
FOR SELECT USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "Admins can manage partner capital distribution" ON public.partner_capital_distribution
FOR ALL USING (has_role('admin') OR has_role('owner'));

-- إنشاء رصيد إجازات للموظفين الحاليين
INSERT INTO public.vacation_balance (employee_id, annual_days_total, annual_days_remaining, sick_days_total, sick_days_remaining, emergency_days_total, emergency_days_remaining)
SELECT 
  id,
  21,
  21,
  30,
  30,
  5,
  5
FROM public.employees
WHERE NOT EXISTS (
  SELECT 1 FROM public.vacation_balance vb WHERE vb.employee_id = employees.id
);

-- إنشاء trigger لحساب رصيد الإجازات تلقائياً
CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS TRIGGER AS $$
DECLARE
  months_worked INTEGER;
  annual_entitlement NUMERIC;
BEGIN
  -- حساب عدد الشهور من تاريخ التعيين
  SELECT 
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.joining_date)) * 12 + 
    EXTRACT(MONTH FROM AGE(CURRENT_DATE, e.joining_date))
  INTO months_worked
  FROM public.employees e 
  WHERE e.id = NEW.employee_id;

  -- حساب الاستحقاق السنوي (21 يوم بعد سنة كاملة)
  annual_entitlement := CASE 
    WHEN months_worked >= 12 THEN 21
    ELSE (months_worked::NUMERIC / 12) * 21
  END;

  NEW.annual_days_total := annual_entitlement;
  NEW.annual_days_remaining := annual_entitlement - COALESCE(NEW.annual_days_used, 0);
  NEW.last_calculation_date := CURRENT_DATE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vacation_balance_calculation
  BEFORE INSERT OR UPDATE ON public.vacation_balance
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_vacation_balance();