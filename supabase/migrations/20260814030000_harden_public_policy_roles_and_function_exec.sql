-- Prevent unauthenticated access through policies that were implicitly assigned to PUBLIC.
-- Authenticated clients retain the same policy predicates; service_role bypasses RLS.
BEGIN;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND 'public' = ANY (roles)
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END;
$$;

-- PostgreSQL grants EXECUTE to PUBLIC by default. Revoke that default exposure,
-- while retaining the established authenticated application surface and service jobs.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Pin search_path for the functions reported by the security advisor to prevent
-- role-controlled object resolution while retaining their existing behavior.
DO $$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'log_audit_trail',
        'trigger_set_updated_at',
        'update_api_integrations_updated_at',
        'validate_journal_entry_balance'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path = pg_catalog, public, pg_temp',
      function_record.signature
    );
  END LOOP;
END;
$$;

COMMIT;
