-- Ledger RLS hardening.
-- Journal creation, posting, amendment and reversal must run through audited server-side RPCs.

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS je_insert ON public.journal_entries;
DROP POLICY IF EXISTS je_update ON public.journal_entries;
DROP POLICY IF EXISTS je_delete ON public.journal_entries;
DROP POLICY IF EXISTS jei_all ON public.journal_entry_items;

DROP POLICY IF EXISTS jei_select_finance ON public.journal_entry_items;
CREATE POLICY jei_select_finance
ON public.journal_entry_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.journal_entries je
    WHERE je.id = journal_entry_items.journal_entry_id
      AND public.can_access_company_finance(je.company_id)
  )
);

-- Security definer functions create ledger records after validating the caller; normal clients have no DML rights.
REVOKE INSERT, UPDATE, DELETE ON public.journal_entries FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.journal_entry_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.accounting_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.audit_trail FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.can_access_company_finance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_company_finance(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_any_company_role(uuid, uuid, public.app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_company_role(uuid, uuid, public.app_role[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_any_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, text[]) TO authenticated, service_role;
