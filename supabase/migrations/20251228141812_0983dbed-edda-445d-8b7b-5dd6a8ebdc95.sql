
-- إصلاح الجداول التي لا تحتوي على RLS

-- 1. تمكين RLS على جدول partner_capital_distribution
ALTER TABLE public.partner_capital_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view partner capital"
ON public.partner_capital_distribution FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage partner capital"
ON public.partner_capital_distribution FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 2. تمكين RLS على جدول payroll_journal_entries
ALTER TABLE public.payroll_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and Finance can view payroll entries"
ON public.payroll_journal_entries FOR SELECT
TO authenticated
USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager') OR has_role('finance_manager'));

CREATE POLICY "Admins can manage payroll entries"
ON public.payroll_journal_entries FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 3. تمكين RLS على جدول sponsorship_transfer_fees
ALTER TABLE public.sponsorship_transfer_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transfer fees"
ON public.sponsorship_transfer_fees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage transfer fees"
ON public.sponsorship_transfer_fees FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 4. إضافة سياسات INSERT للجداول المفقودة
CREATE POLICY "Authenticated users can insert capital history"
ON public.capital_history FOR INSERT
TO authenticated
WITH CHECK (has_role('admin') OR has_role('owner'));

CREATE POLICY "Admins can update capital history"
ON public.capital_history FOR UPDATE
TO authenticated
USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "Admins can delete capital history"
ON public.capital_history FOR DELETE
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 5. إضافة سياسات للجداول المالية
CREATE POLICY "Admins can manage financials"
ON public.financials FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "Admins can manage cash flow"
ON public.cash_flow FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 6. إضافة سياسات لجدول الوثائق
CREATE POLICY "Authenticated users can manage company documents"
ON public.company_documents FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner') OR has_role('hr_manager'));

-- 7. إضافة سياسات لجدول التصنيفات
CREATE POLICY "Admins can manage client categories"
ON public.client_categories FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));

-- 8. إضافة سياسات الرسوم الحكومية
CREATE POLICY "Admins can manage government fees"
ON public.government_fees FOR ALL
TO authenticated
USING (has_role('admin') OR has_role('owner'));
