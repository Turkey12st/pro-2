-- إنشاء دوال للتعامل مع تكاملات API
CREATE OR REPLACE FUNCTION public.create_api_integration(
  integration_name TEXT,
  integration_type TEXT,
  integration_endpoint TEXT,
  integration_api_key TEXT DEFAULT NULL,
  integration_headers TEXT DEFAULT '{}',
  integration_events TEXT[] DEFAULT '{}',
  integration_active BOOLEAN DEFAULT true,
  integration_config TEXT DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.api_integrations (
    name, type, endpoint, api_key_encrypted, headers, events, is_active, configuration
  ) VALUES (
    integration_name, 
    integration_type, 
    integration_endpoint, 
    integration_api_key,
    integration_headers::jsonb,
    integration_events,
    integration_active,
    integration_config::jsonb
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- دالة لجلب التكاملات
CREATE OR REPLACE FUNCTION public.get_api_integrations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  endpoint TEXT,
  api_key_encrypted TEXT,
  headers JSONB,
  is_active BOOLEAN,
  events TEXT[],
  last_sync TIMESTAMP WITH TIME ZONE,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.name,
    ai.type,
    ai.endpoint,
    ai.api_key_encrypted,
    ai.headers,
    ai.is_active,
    ai.events,
    ai.last_sync,
    ai.configuration,
    ai.created_at
  FROM public.api_integrations ai
  ORDER BY ai.created_at DESC;
END;
$$;

-- دالة لتحديث وقت المزامنة
CREATE OR REPLACE FUNCTION public.update_integration_sync(
  integration_id UUID,
  sync_time TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_integrations 
  SET last_sync = sync_time 
  WHERE id = integration_id;
END;
$$;

-- دالة لتسجيل أخطاء التكامل
CREATE OR REPLACE FUNCTION public.log_integration_error(
  integration_id UUID,
  event_name TEXT,
  error_msg TEXT,
  payload_data TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.integration_logs (
    integration_id, event, status, error_message, payload
  ) VALUES (
    integration_id, event_name, 'error', error_msg, payload_data::jsonb
  );
END;
$$;

-- دالة لجلب إحصائيات التكامل
CREATE OR REPLACE FUNCTION public.get_integration_stats(integration_id UUID)
RETURNS TABLE (
  totalRequests INTEGER,
  successfulRequests INTEGER,
  failedRequests INTEGER,
  lastSync TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count INTEGER := 0;
  success_count INTEGER := 0;
  failed_count INTEGER := 0;
  last_sync_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.integration_logs
  WHERE integration_logs.integration_id = get_integration_stats.integration_id;
  
  SELECT COUNT(*) INTO success_count
  FROM public.integration_logs
  WHERE integration_logs.integration_id = get_integration_stats.integration_id
    AND status = 'success';
    
  SELECT COUNT(*) INTO failed_count
  FROM public.integration_logs
  WHERE integration_logs.integration_id = get_integration_stats.integration_id
    AND status = 'error';
    
  SELECT MAX(created_at) INTO last_sync_time
  FROM public.integration_logs
  WHERE integration_logs.integration_id = get_integration_stats.integration_id;
  
  RETURN QUERY SELECT total_count, success_count, failed_count, last_sync_time;
END;
$$;