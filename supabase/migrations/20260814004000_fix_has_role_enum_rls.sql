-- Correct legacy has_role overloads used by RLS policies.
-- user_roles.role is public.app_role, while legacy policies call these functions with text role names.
CREATE OR REPLACE FUNCTION public.has_role(_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
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
      AND role::text = _role
  );
$$;

NOTIFY pgrst, 'reload schema';
