
CREATE OR REPLACE FUNCTION public.get_api_integrations()
RETURNS TABLE(id uuid, name text, type text, endpoint text, api_key_encrypted text, headers jsonb, is_active boolean, events text[], last_sync timestamp with time zone, configuration jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_admin_owner() THEN
    RAISE EXCEPTION 'غير مصرّح';
  END IF;
  RETURN QUERY
  SELECT ai.id, ai.name, ai.type, ai.endpoint,
         CASE WHEN ai.api_key_encrypted IS NOT NULL AND ai.api_key_encrypted <> '' THEN '••••••••' ELSE NULL END,
         ai.headers, ai.is_active, ai.events, ai.last_sync, ai.configuration, ai.created_at
  FROM public.api_integrations ai
  ORDER BY ai.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.create_api_integration(integration_name text, integration_type text, integration_endpoint text, integration_api_key text DEFAULT NULL::text, integration_headers text DEFAULT '{}'::text, integration_events text[] DEFAULT '{}'::text[], integration_active boolean DEFAULT true, integration_config text DEFAULT '{}'::text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.is_admin_owner() THEN
    RAISE EXCEPTION 'غير مصرّح';
  END IF;
  INSERT INTO public.api_integrations (name, type, endpoint, api_key_encrypted, headers, events, is_active, configuration)
  VALUES (integration_name, integration_type, integration_endpoint, integration_api_key,
          integration_headers::jsonb, integration_events, integration_active, integration_config::jsonb)
  RETURNING id INTO new_id;
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.delete_journal_entry(p_entry_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_admin_owner() THEN
    RAISE EXCEPTION 'غير مصرّح بحذف القيود';
  END IF;
  IF EXISTS (SELECT 1 FROM public.journal_entries WHERE id = p_entry_id AND status = 'posted') THEN
    RAISE EXCEPTION 'لا يمكن حذف قيد مُرحّل';
  END IF;
  DELETE FROM public.journal_entries WHERE id = p_entry_id;
END; $$;

REVOKE ALL ON FUNCTION public.get_api_integrations(), public.delete_journal_entry(uuid),
  public.create_api_integration(text,text,text,text,text,text[],boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_api_integrations(), public.delete_journal_entry(uuid),
  public.create_api_integration(text,text,text,text,text,text[],boolean,text) TO authenticated, service_role;
