-- Fix RLS policies that pass text[] role names to an app_role enum column.
-- Comparing the enum through its text representation keeps existing policy calls compatible.
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = ANY(_roles)
  );
$$;

NOTIFY pgrst, 'reload schema';
