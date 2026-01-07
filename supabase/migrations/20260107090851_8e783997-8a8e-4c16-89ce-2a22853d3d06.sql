-- =============================================
-- المرحلة 1: هيكل قاعدة البيانات الأساسي لنظام ERP
-- =============================================

-- 1. إنشاء نوع الأدوار (إذا لم يكن موجوداً)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'accountant', 'hr_manager', 'sales_manager', 'viewer');
    END IF;
END $$;

-- 2. إنشاء نوع حالة القيد
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entry_status') THEN
        CREATE TYPE public.entry_status AS ENUM ('draft', 'posted', 'reversed', 'cancelled');
    END IF;
END $$;

-- 3. إنشاء نوع حالة المطابقة البنكية
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE public.match_status AS ENUM ('pending', 'matched', 'manual', 'ignored');
    END IF;
END $$;

-- 4. جدول الشركات (Multi-tenant)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    tax_number TEXT,
    cr_number TEXT,
    address JSONB DEFAULT '{}',
    contact JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{"currency": "SAR", "fiscal_year_start": "01-01"}',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول ربط المستخدمين بالشركات
CREATE TABLE IF NOT EXISTS public.users_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- 6. تحديث جدول الأدوار ليشمل الشركة
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, company_id, role)
);

-- 7. جدول مسار التدقيق الشامل
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT')),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. جدول الحسابات البنكية
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    iban TEXT,
    currency TEXT DEFAULT 'SAR',
    account_type TEXT DEFAULT 'current',
    gl_account_id UUID REFERENCES public.chart_of_accounts(id),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. جدول المعاملات البنكية المستوردة
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    value_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference TEXT,
    transaction_type TEXT,
    status public.match_status DEFAULT 'pending',
    matched_journal_entry_id UUID REFERENCES public.journal_entries(id),
    import_batch_id UUID,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. جدول دفعات الاستيراد
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    bank_account_id UUID REFERENCES public.bank_accounts(id),
    file_name TEXT NOT NULL,
    file_type TEXT,
    total_records INTEGER DEFAULT 0,
    matched_records INTEGER DEFAULT 0,
    pending_records INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing',
    imported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- =============================================
-- تفعيل RLS على جميع الجداول الجديدة
-- =============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- =============================================
-- دوال الأمان (Security Definer Functions)
-- =============================================

-- دالة للحصول على شركات المستخدم
CREATE OR REPLACE FUNCTION public.get_user_companies(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM users_companies WHERE user_id = _user_id;
$$;

-- دالة للتحقق من دور المستخدم في شركة معينة
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id UUID, _company_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id
        AND company_id = _company_id
        AND role = _role
    );
$$;

-- دالة للتحقق من أي دور في شركة
CREATE OR REPLACE FUNCTION public.has_any_company_role(_user_id UUID, _company_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id
        AND company_id = _company_id
        AND role = ANY(_roles)
    );
$$;

-- دالة للحصول على الشركة الافتراضية للمستخدم
CREATE OR REPLACE FUNCTION public.get_default_company(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM users_companies 
    WHERE user_id = _user_id AND is_default = true
    LIMIT 1;
$$;

-- =============================================
-- سياسات RLS
-- =============================================

-- سياسات جدول الشركات
CREATE POLICY "Users can view their companies" ON public.companies
FOR SELECT USING (id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "Owners can update their company" ON public.companies
FOR UPDATE USING (
    public.has_any_company_role(auth.uid(), id, ARRAY['admin', 'owner']::app_role[])
);

-- سياسات جدول ربط المستخدمين بالشركات
CREATE POLICY "Users can view their company memberships" ON public.users_companies
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company memberships" ON public.users_companies
FOR ALL USING (
    public.has_any_company_role(auth.uid(), company_id, ARRAY['admin', 'owner']::app_role[])
);

-- سياسات جدول الأدوار
CREATE POLICY "Users can view roles in their companies" ON public.user_roles
FOR SELECT USING (company_id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (
    public.has_any_company_role(auth.uid(), company_id, ARRAY['admin', 'owner']::app_role[])
);

-- سياسات مسار التدقيق
CREATE POLICY "Users can view audit in their companies" ON public.audit_trail
FOR SELECT USING (company_id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "System can insert audit" ON public.audit_trail
FOR INSERT WITH CHECK (true);

-- سياسات الحسابات البنكية
CREATE POLICY "Users can view bank accounts in their companies" ON public.bank_accounts
FOR SELECT USING (company_id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "Accountants can manage bank accounts" ON public.bank_accounts
FOR ALL USING (
    public.has_any_company_role(auth.uid(), company_id, ARRAY['admin', 'owner', 'accountant']::app_role[])
);

-- سياسات المعاملات البنكية
CREATE POLICY "Users can view bank transactions in their companies" ON public.bank_transactions
FOR SELECT USING (company_id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "Accountants can manage bank transactions" ON public.bank_transactions
FOR ALL USING (
    public.has_any_company_role(auth.uid(), company_id, ARRAY['admin', 'owner', 'accountant']::app_role[])
);

-- سياسات دفعات الاستيراد
CREATE POLICY "Users can view import batches in their companies" ON public.import_batches
FOR SELECT USING (company_id IN (SELECT public.get_user_companies(auth.uid())));

CREATE POLICY "Accountants can manage import batches" ON public.import_batches
FOR ALL USING (
    public.has_any_company_role(auth.uid(), company_id, ARRAY['admin', 'owner', 'accountant']::app_role[])
);

-- =============================================
-- Trigger لتسجيل التغييرات في مسار التدقيق
-- =============================================

CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_trail (company_id, user_id, table_name, record_id, action, new_data)
        VALUES (NEW.company_id, auth.uid(), TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_trail (company_id, user_id, table_name, record_id, action, old_data, new_data)
        VALUES (NEW.company_id, auth.uid(), TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_trail (company_id, user_id, table_name, record_id, action, old_data)
        VALUES (OLD.company_id, auth.uid(), TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', to_jsonb(OLD));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق Trigger على الجداول المهمة
CREATE TRIGGER audit_journal_entries
    AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_bank_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.bank_transactions
    FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail();

-- =============================================
-- Trigger للتحقق من توازن القيود المحاسبية
-- =============================================

CREATE OR REPLACE FUNCTION public.validate_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_total_debit DECIMAL(15,2);
    v_total_credit DECIMAL(15,2);
BEGIN
    -- حساب المجاميع
    SELECT 
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO v_total_debit, v_total_credit
    FROM public.journal_entry_items
    WHERE journal_entry_id = NEW.journal_entry_id;
    
    -- تحديث المجاميع في القيد الرئيسي
    UPDATE public.journal_entries
    SET 
        total_debit = v_total_debit,
        total_credit = v_total_credit,
        updated_at = now()
    WHERE id = NEW.journal_entry_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entry_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_items
    FOR EACH ROW EXECUTE FUNCTION public.validate_journal_entry_balance();

-- =============================================
-- إضافة company_id للجداول الموجودة (إذا لم يكن موجوداً)
-- =============================================

DO $$ 
BEGIN
    -- إضافة company_id لجدول chart_of_accounts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chart_of_accounts' AND column_name = 'company_id') THEN
        ALTER TABLE public.chart_of_accounts ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
    
    -- إضافة company_id لجدول journal_entries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'journal_entries' AND column_name = 'company_id') THEN
        ALTER TABLE public.journal_entries ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
    
    -- إضافة company_id لجدول clients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'company_id') THEN
        ALTER TABLE public.clients ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
    
    -- إضافة company_id لجدول employees
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'company_id') THEN
        ALTER TABLE public.employees ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
END $$;

-- =============================================
-- إنشاء فهارس للأداء
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_companies_user ON public.users_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_users_companies_company ON public.users_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company ON public.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_company ON public.audit_trail(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON public.audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_company ON public.bank_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON public.bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date DESC);