
-- 1) Fix ambiguous variable names in totals recalculation
CREATE OR REPLACE FUNCTION public.validate_journal_entry_on_item_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_total_debit numeric;
  v_total_credit numeric;
  v_entry_id uuid;
BEGIN
  v_entry_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.journal_entry_id ELSE NEW.journal_entry_id END;

  SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
    INTO v_total_debit, v_total_credit
  FROM public.journal_entry_items
  WHERE journal_entry_id = v_entry_id;

  UPDATE public.journal_entries
     SET total_debit = v_total_debit,
         total_credit = v_total_credit,
         updated_at = now()
   WHERE id = v_entry_id;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END; $$;

-- 2) auto_saves: owner-only
DROP POLICY IF EXISTS "Users can read all auto-saves" ON public.auto_saves;
DROP POLICY IF EXISTS "Users can update any auto-saves" ON public.auto_saves;
DROP POLICY IF EXISTS "Users can delete any auto-saves" ON public.auto_saves;
DROP POLICY IF EXISTS "auto_saves_owner_select" ON public.auto_saves;
DROP POLICY IF EXISTS "auto_saves_owner_update" ON public.auto_saves;
DROP POLICY IF EXISTS "auto_saves_owner_delete" ON public.auto_saves;

CREATE POLICY "auto_saves_owner_select" ON public.auto_saves FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "auto_saves_owner_update" ON public.auto_saves FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auto_saves_owner_delete" ON public.auto_saves FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3) capital_management & cash_flow: finance roles only
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.capital_management;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cash_flow;
DROP POLICY IF EXISTS "capital_management_finance_select" ON public.capital_management;
DROP POLICY IF EXISTS "cash_flow_finance_select" ON public.cash_flow;

CREATE POLICY "capital_management_finance_select" ON public.capital_management FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant','finance_manager']));

CREATE POLICY "cash_flow_finance_select" ON public.cash_flow FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant','finance_manager']));
