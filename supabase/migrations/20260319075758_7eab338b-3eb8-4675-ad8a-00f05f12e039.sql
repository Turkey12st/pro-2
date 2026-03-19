-- Fix #1: Setup the owner account properly
-- Create a default company for the owner
INSERT INTO public.companies (id, name, name_en, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'الشركة الرئيسية', 'Main Company', true)
ON CONFLICT (id) DO NOTHING;

-- Link all existing users to the company
INSERT INTO public.users_companies (user_id, company_id, is_default)
SELECT id, '00000000-0000-0000-0000-000000000001', true
FROM auth.users
ON CONFLICT DO NOTHING;

-- Assign 'admin' role to turkey12st@yahoo.com (the owner)
INSERT INTO public.user_roles (user_id, company_id, role)
VALUES ('e5ec7ee3-f451-4475-8dc0-f2fb84c29d43', '00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT DO NOTHING;

-- Assign 'admin' role to other existing users too
INSERT INTO public.user_roles (user_id, company_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'admin'
FROM auth.users
WHERE id != 'e5ec7ee3-f451-4475-8dc0-f2fb84c29d43'
ON CONFLICT DO NOTHING;

-- Fix #2: Auto-setup trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_company_id uuid;
  user_count int;
BEGIN
  SELECT id INTO default_company_id FROM public.companies WHERE is_active = true LIMIT 1;
  
  IF default_company_id IS NULL THEN
    INSERT INTO public.companies (name, name_en, is_active)
    VALUES ('الشركة الرئيسية', 'Main Company', true)
    RETURNING id INTO default_company_id;
  END IF;

  INSERT INTO public.users_companies (user_id, company_id, is_default)
  VALUES (NEW.id, default_company_id, true)
  ON CONFLICT DO NOTHING;

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, default_company_id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (NEW.id, default_company_id, 'viewer')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_setup();

-- Fix #3: RLS policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.users_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own company links" ON public.users_companies;
CREATE POLICY "Users can read own company links" ON public.users_companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.companies;
CREATE POLICY "Authenticated users can read companies" ON public.companies
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Fix #4: employees RLS for admins
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'hr_manager')
    )
  );

DROP POLICY IF EXISTS "Authenticated can read employees" ON public.employees;
CREATE POLICY "Authenticated can read employees" ON public.employees
  FOR SELECT
  TO authenticated
  USING (true);