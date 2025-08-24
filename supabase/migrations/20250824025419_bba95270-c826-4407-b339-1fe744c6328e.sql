-- إصلاح مشاكل الأمان وإضافة تحسينات أساسية

-- إنشاء جدول تفضيلات النظام
CREATE TABLE IF NOT EXISTS public.system_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS على جدول التفضيلات
ALTER TABLE public.system_preferences ENABLE ROW LEVEL SECURITY;

-- سياسات للتفضيلات
CREATE POLICY "Users can manage their own preferences"
ON public.system_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- إنشاء جدول أذونات مخصصة
CREATE TABLE IF NOT EXISTS public.custom_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL,
  resource_id UUID,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- تفعيل RLS على الأذونات المخصصة
ALTER TABLE public.custom_permissions ENABLE ROW LEVEL SECURITY;

-- سياسات للأذونات المخصصة
CREATE POLICY "Admins can manage custom permissions"
ON public.custom_permissions
FOR ALL
USING (has_role('admin') OR has_role('owner'));

-- إنشاء جدول نشاط النظام
CREATE TABLE IF NOT EXISTS public.system_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS على نشاط النظام
ALTER TABLE public.system_activity ENABLE ROW LEVEL SECURITY;

-- سياسات لنشاط النظام
CREATE POLICY "Admins can view system activity"
ON public.system_activity
FOR SELECT
USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "System can log activity"
ON public.system_activity
FOR INSERT
WITH CHECK (true);

-- إنشاء دالة محسنة للأذونات
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission TEXT,
  _resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    AND (
      ur.role IN ('admin', 'owner')
      OR _permission = ANY(COALESCE(ur.permissions, '[]'::jsonb)::text[])
    )
  ) OR EXISTS (
    SELECT 1 FROM public.custom_permissions cp
    WHERE cp.user_id = _user_id
    AND cp.permission_type = _permission
    AND cp.is_active = true
    AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
    AND (cp.resource_id IS NULL OR cp.resource_id = _resource_id)
  );
$$;

-- تحديث دالة has_role لتكون أكثر أماناً
CREATE OR REPLACE FUNCTION public.has_role(_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

-- إضافة trigger لتسجيل النشاط
CREATE OR REPLACE FUNCTION public.log_system_activity()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.system_activity (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    )
  );
  
  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- إضافة triggers لتسجيل النشاط على الجداول المهمة
DROP TRIGGER IF EXISTS log_user_roles_activity ON public.user_roles;
CREATE TRIGGER log_user_roles_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_system_activity();

DROP TRIGGER IF EXISTS log_employees_activity ON public.employees;
CREATE TRIGGER log_employees_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.log_system_activity();

-- تحديث دالة update_updated_at لاستخدام search_path آمن
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;