CREATE OR REPLACE FUNCTION public.approve_request(
  p_type text,
  p_id uuid,
  p_action text,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_old jsonb;
  v_new jsonb;
  v_company uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'غير مصرّح';
  END IF;
  IF p_action NOT IN ('approve','reject') THEN
    RAISE EXCEPTION 'إجراء غير صالح';
  END IF;

  IF p_type = 'leave' THEN
    IF NOT public.has_any_role(v_uid, ARRAY['admin','owner','hr_manager']) THEN
      RAISE EXCEPTION 'لا تملك صلاحية اعتماد الإجازات';
    END IF;

    SELECT to_jsonb(l), l.company_id INTO v_old, v_company FROM public.leaves l WHERE l.id = p_id;
    IF v_old IS NULL THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
    IF v_old->>'status' <> 'pending' THEN RAISE EXCEPTION 'تمت معالجة الطلب مسبقاً'; END IF;

    UPDATE public.leaves
      SET status = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
          approved_by = v_uid,
          approved_at = now(),
          rejection_reason = CASE WHEN p_action = 'reject' THEN p_notes ELSE rejection_reason END,
          updated_at = now()
      WHERE id = p_id
      RETURNING to_jsonb(leaves.*) INTO v_new;

  ELSIF p_type = 'journal_entry' THEN
    IF NOT public.has_any_role(v_uid, ARRAY['admin','owner','accountant','finance_manager']) THEN
      RAISE EXCEPTION 'لا تملك صلاحية اعتماد القيود';
    END IF;

    SELECT to_jsonb(j), j.company_id INTO v_old, v_company FROM public.journal_entries j WHERE j.id = p_id;
    IF v_old IS NULL THEN RAISE EXCEPTION 'القيد غير موجود'; END IF;
    IF v_old->>'status' <> 'draft' THEN RAISE EXCEPTION 'تمت معالجة القيد مسبقاً'; END IF;
    IF p_action = 'approve' AND COALESCE((v_old->>'total_debit')::numeric,0) <> COALESCE((v_old->>'total_credit')::numeric,0) THEN
      RAISE EXCEPTION 'القيد غير متوازن، لا يمكن ترحيله';
    END IF;

    UPDATE public.journal_entries
      SET status = CASE WHEN p_action = 'approve' THEN 'posted' ELSE 'cancelled' END,
          approved_by = v_uid,
          approved_at = now(),
          posted_by = CASE WHEN p_action = 'approve' THEN v_uid ELSE posted_by END,
          posted_at = CASE WHEN p_action = 'approve' THEN now() ELSE posted_at END,
          updated_at = now()
      WHERE id = p_id
      RETURNING to_jsonb(journal_entries.*) INTO v_new;
  ELSE
    RAISE EXCEPTION 'نوع طلب غير مدعوم';
  END IF;

  INSERT INTO public.audit_trail (table_name, record_id, action, old_data, new_data, user_id, company_id)
  VALUES (
    CASE WHEN p_type = 'leave' THEN 'leaves' ELSE 'journal_entries' END,
    p_id::text,
    CASE WHEN p_action = 'approve' THEN 'APPROVE' ELSE 'REJECT' END,
    v_old,
    v_new || jsonb_build_object('approval_notes', p_notes),
    v_uid,
    v_company
  );

  RETURN jsonb_build_object('success', true, 'status', v_new->>'status');
END;
$$;

REVOKE ALL ON FUNCTION public.approve_request(text, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_request(text, uuid, text, text) TO authenticated;