-- Existing functions carried explicit EXECUTE grants for anon in their ACLs.
-- Remove those grants while preserving authenticated application calls and service-role jobs.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
