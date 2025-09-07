-- إصلاح الخطأ وإنشاء الجداول المفقودة

-- حذف السياسة المكررة إذا كانت موجودة
DROP POLICY IF EXISTS "HR staff can manage employee benefits" ON public.employee_benefits;

-- إنشاء السياسات المطلوبة
CREATE POLICY "HR staff can manage employee benefits" ON public.employee_benefits
FOR ALL USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

-- إضافة بيانات أولية لتوزيع الشركاء
INSERT INTO public.partner_capital_distribution (partner_name, ownership_percentage, capital_amount, share_count)
SELECT 
  name,
  ownership_percentage,
  share_value,
  1
FROM public.company_partners
ON CONFLICT DO NOTHING;