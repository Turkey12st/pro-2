
-- Function to add a document to a partner's documents array
CREATE OR REPLACE FUNCTION public.add_partner_document(
  p_partner_id UUID,
  p_document_name TEXT,
  p_document_url TEXT,
  p_document_type TEXT,
  p_document_size BIGINT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_document JSONB;
BEGIN
  v_document := jsonb_build_object(
    'id', gen_random_uuid(),
    'name', p_document_name,
    'url', p_document_url,
    'type', p_document_type,
    'size', p_document_size,
    'uploadedAt', now()
  );
  
  -- Add document to the partner's documents array
  UPDATE public.company_partners
  SET documents = COALESCE(documents, '[]'::jsonb) || v_document
  WHERE id = p_partner_id;
END;
$$;
