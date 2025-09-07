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