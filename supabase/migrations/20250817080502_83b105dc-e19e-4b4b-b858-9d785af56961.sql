-- إنشاء جدول تكاملات API
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook', 'rest_api', 'n8n', 'zapier', 'custom')),
  endpoint TEXT NOT NULL,
  api_key_encrypted TEXT,
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  events TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- إنشاء جدول سجلات التكامل
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  payload JSONB,
  response JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- تفعيل RLS
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول api_integrations
CREATE POLICY "Admins can manage API integrations" ON public.api_integrations
  FOR ALL USING (has_role('admin') OR has_role('owner'));

-- سياسات الأمان لجدول integration_logs  
CREATE POLICY "Admins can view integration logs" ON public.integration_logs
  FOR SELECT USING (has_role('admin') OR has_role('owner'));

CREATE POLICY "System can insert integration logs" ON public.integration_logs
  FOR INSERT WITH CHECK (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_api_integrations_type ON public.api_integrations(type);
CREATE INDEX IF NOT EXISTS idx_api_integrations_active ON public.api_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_event ON public.integration_logs(event);
CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON public.integration_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at);

-- تحديث الطوابع الزمنية تلقائياً
CREATE OR REPLACE FUNCTION public.update_api_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_api_integrations_updated_at();