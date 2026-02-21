
-- =====================================================
-- المرحلة 1: الهيكل الأساسي - الجداول والعلاقات
-- =====================================================

-- 1. جدول الأقسام
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    parent_department_id UUID REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    budget_code TEXT,
    cost_center TEXT,
    manager_id UUID, -- سيتم ربطه بـ employees لاحقاً لتجنب circular dependency
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE public.departments IS 'الأقسام التنظيمية للشركة - مصدر واحد للحقيقة لبيانات الأقسام';

-- 2. جدول المسميات الوظيفية
CREATE TABLE IF NOT EXISTS public.job_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_en TEXT,
    level INTEGER DEFAULT 1,
    min_salary NUMERIC(15,2) DEFAULT 0,
    max_salary NUMERIC(15,2) DEFAULT 0,
    department_id UUID REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE public.job_titles IS 'المسميات الوظيفية مع نطاقات الرواتب - مرتبطة بالأقسام';

-- 3. إضافة أعمدة FK للموظفين (الحفاظ على البيانات الحالية)
ALTER TABLE public.employees 
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS job_title_id UUID REFERENCES public.job_titles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS employee_code TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- إضافة unique constraint على employee_code
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_employee_code_key') THEN
        ALTER TABLE public.employees ADD CONSTRAINT employees_employee_code_key UNIQUE (employee_code);
    END IF;
END $$;

COMMENT ON COLUMN public.employees.department_id IS 'FK → departments.id - القسم الفعلي (يحل محل حقل department النصي)';
COMMENT ON COLUMN public.employees.job_title_id IS 'FK → job_titles.id - المسمى الوظيفي المرتبط بنطاق الراتب';

-- 4. ربط manager_id في departments بعد إنشاء employees FK
ALTER TABLE public.departments 
    DROP CONSTRAINT IF EXISTS departments_manager_id_fkey;
ALTER TABLE public.departments 
    ADD CONSTRAINT departments_manager_id_fkey 
    FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 5. مكونات الراتب (بدلات / خصومات)
CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
    calculation_method TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
    default_amount NUMERIC(15,2) DEFAULT 0,
    percentage_of TEXT, -- مثلاً 'base_salary'
    is_taxable BOOLEAN DEFAULT false,
    is_gosi_applicable BOOLEAN DEFAULT false,
    account_id UUID REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE public.salary_components IS 'مكونات الراتب (بدلات/خصومات) مع طريقة الحساب والربط المحاسبي';

-- 6. دورات الرواتب
CREATE TABLE IF NOT EXISTS public.payroll_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payment_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'cancelled')),
    is_locked BOOLEAN DEFAULT false,
    total_gross NUMERIC(15,2) DEFAULT 0,
    total_net NUMERIC(15,2) DEFAULT 0,
    total_deductions NUMERIC(15,2) DEFAULT 0,
    employees_count INTEGER DEFAULT 0,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE public.payroll_cycles IS 'دورات الرواتب الشهرية - تتحكم في حالة المعالجة والاعتماد';

-- 7. رواتب الموظفين (لكل دورة)
CREATE TABLE IF NOT EXISTS public.employee_salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    payroll_cycle_id UUID NOT NULL REFERENCES public.payroll_cycles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    base_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
    housing_allowance NUMERIC(15,2) DEFAULT 0,
    transportation_allowance NUMERIC(15,2) DEFAULT 0,
    allowances_total NUMERIC(15,2) DEFAULT 0,
    deductions_total NUMERIC(15,2) DEFAULT 0,
    gosi_employee NUMERIC(15,2) DEFAULT 0,
    gosi_company NUMERIC(15,2) DEFAULT 0,
    gross_pay NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_pay NUMERIC(15,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid', 'cancelled')),
    payment_method TEXT DEFAULT 'bank_transfer',
    notes TEXT,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    UNIQUE (employee_id, payroll_cycle_id)
);

COMMENT ON TABLE public.employee_salaries IS 'راتب كل موظف في كل دورة - يُحسب تلقائياً من salary_components';

-- 8. تفاصيل الراتب (مكونات كل راتب)
CREATE TABLE IF NOT EXISTS public.salary_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_salary_id UUID NOT NULL REFERENCES public.employee_salaries(id) ON UPDATE CASCADE ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES public.salary_components(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    calculation_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.salary_details IS 'تفصيل مكونات الراتب لكل موظف في كل دورة';

-- 9. جدول الإجازات
CREATE TABLE IF NOT EXISTS public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    leave_type TEXT NOT NULL DEFAULT 'annual' CHECK (leave_type IN ('annual', 'sick', 'unpaid', 'maternity', 'paternity', 'emergency', 'hajj', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reason TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

COMMENT ON TABLE public.leaves IS 'طلبات الإجازات مع سير العمل (طلب→اعتماد→خصم من الرصيد)';

-- 10. أرصدة الإجازات
CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    remaining_days NUMERIC(5,1) GENERATED ALWAYS AS (total_days - used_days) STORED,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (employee_id, leave_type, year)
);

COMMENT ON TABLE public.employee_leave_balances IS 'أرصدة الإجازات - يتم خصمها تلقائياً عند اعتماد الإجازة';

-- 11. سجل المزامنة
CREATE TABLE IF NOT EXISTS public.data_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_module TEXT NOT NULL,
    source_table TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    synced_to_modules TEXT[] DEFAULT '{}',
    changes JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
    error_message TEXT,
    company_id UUID REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);

COMMENT ON TABLE public.data_sync_log IS 'سجل مزامنة البيانات بين الوحدات - يتتبع كل تغيير وانعكاسه';

-- =====================================================
-- Triggers للتحديث التلقائي
-- =====================================================

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق trigger على جميع الجداول الجديدة
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['departments', 'job_titles', 'salary_components', 'payroll_cycles', 'employee_salaries', 'leaves', 'employee_leave_balances', 'employees']
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.trigger_set_updated_at();
        ', tbl, tbl);
    END LOOP;
END $$;

-- Trigger: عند تعديل راتب الموظف → تحديث employee_salaries للدورة الحالية
CREATE OR REPLACE FUNCTION public.trigger_update_employee_salary()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.salary IS DISTINCT FROM NEW.salary 
       OR OLD.base_salary IS DISTINCT FROM NEW.base_salary
       OR OLD.housing_allowance IS DISTINCT FROM NEW.housing_allowance
       OR OLD.transportation_allowance IS DISTINCT FROM NEW.transportation_allowance THEN
        
        -- تحديث الرواتب في الدورات غير المقفلة
        UPDATE public.employee_salaries es
        SET 
            base_salary = COALESCE(NEW.base_salary, NEW.salary, 0),
            housing_allowance = COALESCE(NEW.housing_allowance, 0),
            transportation_allowance = COALESCE(NEW.transportation_allowance, 0),
            gross_pay = COALESCE(NEW.base_salary, NEW.salary, 0) + COALESCE(NEW.housing_allowance, 0) + COALESCE(NEW.transportation_allowance, 0),
            net_pay = COALESCE(NEW.base_salary, NEW.salary, 0) + COALESCE(NEW.housing_allowance, 0) + COALESCE(NEW.transportation_allowance, 0) - COALESCE(NEW.employee_gosi_contribution, 0),
            updated_at = now()
        FROM public.payroll_cycles pc
        WHERE es.payroll_cycle_id = pc.id
          AND es.employee_id = NEW.id
          AND es.status = 'draft'
          AND pc.is_locked = false;
        
        -- تسجيل المزامنة
        INSERT INTO public.data_sync_log (source_module, source_table, record_id, action, synced_to_modules, changes, status)
        VALUES ('hr', 'employees', NEW.id, 'UPDATE', ARRAY['payroll'], 
                jsonb_build_object('old_salary', OLD.salary, 'new_salary', NEW.salary), 'synced');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_employee_salary_update ON public.employees;
CREATE TRIGGER trigger_employee_salary_update
AFTER UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_employee_salary();

-- Trigger: عند اعتماد إجازة → خصم من الرصيد
CREATE OR REPLACE FUNCTION public.trigger_leave_balance_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- خصم من رصيد الإجازات
        INSERT INTO public.employee_leave_balances (employee_id, leave_type, year, total_days, used_days, company_id)
        VALUES (NEW.employee_id, NEW.leave_type, EXTRACT(YEAR FROM NEW.start_date), 30, NEW.days_count, NEW.company_id)
        ON CONFLICT (employee_id, leave_type, year) 
        DO UPDATE SET 
            used_days = employee_leave_balances.used_days + NEW.days_count,
            updated_at = now();
        
        -- تسجيل المزامنة
        INSERT INTO public.data_sync_log (source_module, source_table, record_id, action, synced_to_modules, changes, status)
        VALUES ('hr', 'leaves', NEW.id, 'UPDATE', ARRAY['leave_balances'], 
                jsonb_build_object('days_deducted', NEW.days_count, 'leave_type', NEW.leave_type), 'synced');
    END IF;
    
    -- إعادة الرصيد عند إلغاء الإجازة
    IF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
        UPDATE public.employee_leave_balances
        SET used_days = GREATEST(0, used_days - OLD.days_count), updated_at = now()
        WHERE employee_id = OLD.employee_id 
          AND leave_type = OLD.leave_type 
          AND year = EXTRACT(YEAR FROM OLD.start_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_leave_balance ON public.leaves;
CREATE TRIGGER trigger_leave_balance
AFTER INSERT OR UPDATE ON public.leaves
FOR EACH ROW
EXECUTE FUNCTION public.trigger_leave_balance_update();

-- Trigger: عند اعتماد الراتب → إنشاء قيد محاسبي تلقائي
CREATE OR REPLACE FUNCTION public.trigger_payroll_to_finance()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_emp_name TEXT;
    v_cycle_name TEXT;
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- جلب بيانات الموظف والدورة
        SELECT name INTO v_emp_name FROM public.employees WHERE id = NEW.employee_id;
        SELECT name INTO v_cycle_name FROM public.payroll_cycles WHERE id = NEW.payroll_cycle_id;
        
        -- إنشاء قيد محاسبي
        INSERT INTO public.journal_entries (
            description, entry_date, total_debit, total_credit,
            reference_number, status, entry_type, company_id
        ) VALUES (
            'راتب ' || COALESCE(v_emp_name, 'موظف') || ' - ' || COALESCE(v_cycle_name, 'دورة'),
            COALESCE(NEW.updated_at::date, CURRENT_DATE),
            NEW.gross_pay + COALESCE(NEW.gosi_company, 0),
            NEW.gross_pay + COALESCE(NEW.gosi_company, 0),
            'PAY-' || LEFT(NEW.id::text, 8),
            'posted',
            'payroll',
            NEW.company_id
        ) RETURNING id INTO v_journal_id;
        
        -- تسجيل المزامنة
        INSERT INTO public.data_sync_log (source_module, source_table, record_id, action, synced_to_modules, changes, status)
        VALUES ('payroll', 'employee_salaries', NEW.id, 'UPDATE', ARRAY['finance'], 
                jsonb_build_object('journal_entry_id', v_journal_id, 'amount', NEW.gross_pay), 'synced');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_salary_to_finance ON public.employee_salaries;
CREATE TRIGGER trigger_salary_to_finance
AFTER UPDATE ON public.employee_salaries
FOR EACH ROW
EXECUTE FUNCTION public.trigger_payroll_to_finance();

-- =====================================================
-- RLS Policies (أساسية للتطوير)
-- =====================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;

-- سياسات مؤقتة للتطوير (authenticated يمكنه الوصول)
-- سيتم تشديدها في المرحلة 3 (RBAC)
CREATE POLICY "auth_select_departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_job_titles" ON public.job_titles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_job_titles" ON public.job_titles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_salary_components" ON public.salary_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_salary_components" ON public.salary_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_payroll_cycles" ON public.payroll_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_payroll_cycles" ON public.payroll_cycles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_employee_salaries" ON public.employee_salaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_employee_salaries" ON public.employee_salaries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_salary_details" ON public.salary_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_salary_details" ON public.salary_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_leaves" ON public.leaves FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_leaves" ON public.leaves FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_leave_balances" ON public.employee_leave_balances FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_all_leave_balances" ON public.employee_leave_balances FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_select_sync_log" ON public.data_sync_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_sync_log" ON public.data_sync_log FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- فهارس للأداء
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_job_title_id ON public.employees(job_title_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee_id ON public.employee_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_cycle_id ON public.employee_salaries(payroll_cycle_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_status ON public.employee_salaries(status);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON public.leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_salary_details_salary_id ON public.salary_details(employee_salary_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_record ON public.data_sync_log(source_table, record_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_job_titles_department_id ON public.job_titles(department_id);
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_company_id ON public.payroll_cycles(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_status ON public.payroll_cycles(status);
