-- Phase 2A: Improve Chart of Accounts with company_id isolation

-- 1. Update RLS policies for chart_of_accounts to use company_id
DROP POLICY IF EXISTS "Users can view chart of accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "Only admins can modify chart of accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "Only admins can update chart of accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "Only admins can delete chart of accounts" ON chart_of_accounts;

-- Create new RLS policies based on company_id
CREATE POLICY "Users can view chart of accounts in their companies"
ON chart_of_accounts FOR SELECT
USING (
  company_id IS NULL OR 
  company_id IN (SELECT get_user_companies(auth.uid()))
);

CREATE POLICY "Accountants can insert chart of accounts"
ON chart_of_accounts FOR INSERT
WITH CHECK (
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role, 'accountant'::app_role])
);

CREATE POLICY "Accountants can update chart of accounts"
ON chart_of_accounts FOR UPDATE
USING (
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role, 'accountant'::app_role])
);

CREATE POLICY "Admins can delete chart of accounts"
ON chart_of_accounts FOR DELETE
USING (
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role])
);

-- 2. Update RLS policies for journal_entries to use company_id
DROP POLICY IF EXISTS "Users can view journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Only admins can insert journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Only admins can update journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Only admins can delete journal entries" ON journal_entries;

CREATE POLICY "Users can view journal entries in their companies"
ON journal_entries FOR SELECT
USING (
  company_id IS NULL OR 
  company_id IN (SELECT get_user_companies(auth.uid()))
);

CREATE POLICY "Accountants can insert journal entries"
ON journal_entries FOR INSERT
WITH CHECK (
  company_id IS NULL OR
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role, 'accountant'::app_role])
);

CREATE POLICY "Accountants can update journal entries"
ON journal_entries FOR UPDATE
USING (
  company_id IS NULL OR
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role, 'accountant'::app_role])
);

CREATE POLICY "Admins can delete journal entries"
ON journal_entries FOR DELETE
USING (
  company_id IS NULL OR
  has_any_company_role(auth.uid(), company_id, ARRAY['admin'::app_role, 'owner'::app_role])
);

-- 3. Create a function to validate journal entry balance (Debit = Credit)
CREATE OR REPLACE FUNCTION check_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debit NUMERIC;
  total_credit NUMERIC;
BEGIN
  -- Calculate totals from journal_entry_items
  SELECT 
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO total_debit, total_credit
  FROM journal_entry_items
  WHERE journal_entry_id = NEW.id;
  
  -- Update the journal entry with calculated totals
  NEW.total_debit := total_debit;
  NEW.total_credit := total_credit;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Create trigger for balance validation on journal_entry_items
CREATE OR REPLACE FUNCTION validate_journal_entry_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
  total_debit NUMERIC;
  total_credit NUMERIC;
  entry_id UUID;
BEGIN
  -- Get the journal entry id
  IF TG_OP = 'DELETE' THEN
    entry_id := OLD.journal_entry_id;
  ELSE
    entry_id := NEW.journal_entry_id;
  END IF;
  
  -- Calculate totals
  SELECT 
    COALESCE(SUM(debit), 0),
    COALESCE(SUM(credit), 0)
  INTO total_debit, total_credit
  FROM journal_entry_items
  WHERE journal_entry_id = entry_id;
  
  -- Update journal entry totals
  UPDATE journal_entries
  SET 
    total_debit = total_debit,
    total_credit = total_credit,
    updated_at = NOW()
  WHERE id = entry_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_journal_entry_totals ON journal_entry_items;

-- Create trigger
CREATE TRIGGER update_journal_entry_totals
AFTER INSERT OR UPDATE OR DELETE ON journal_entry_items
FOR EACH ROW
EXECUTE FUNCTION validate_journal_entry_on_item_change();

-- 5. Create audit trigger for chart_of_accounts
CREATE OR REPLACE FUNCTION audit_chart_of_accounts_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_trail (table_name, record_id, action, new_data, user_id, company_id)
    VALUES ('chart_of_accounts', NEW.id::text, 'INSERT', to_jsonb(NEW), auth.uid(), NEW.company_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_data, new_data, user_id, company_id)
    VALUES ('chart_of_accounts', NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), NEW.company_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_data, user_id, company_id)
    VALUES ('chart_of_accounts', OLD.id::text, 'DELETE', to_jsonb(OLD), auth.uid(), OLD.company_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_chart_of_accounts ON chart_of_accounts;
CREATE TRIGGER audit_chart_of_accounts
AFTER INSERT OR UPDATE OR DELETE ON chart_of_accounts
FOR EACH ROW EXECUTE FUNCTION audit_chart_of_accounts_changes();

-- 6. Create audit trigger for journal_entries
CREATE OR REPLACE FUNCTION audit_journal_entries_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_trail (table_name, record_id, action, new_data, user_id, company_id)
    VALUES ('journal_entries', NEW.id::text, 'INSERT', to_jsonb(NEW), auth.uid(), NEW.company_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_data, new_data, user_id, company_id)
    VALUES ('journal_entries', NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid(), NEW.company_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_data, user_id, company_id)
    VALUES ('journal_entries', OLD.id::text, 'DELETE', to_jsonb(OLD), auth.uid(), OLD.company_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_journal_entries ON journal_entries;
CREATE TRIGGER audit_journal_entries
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION audit_journal_entries_changes();