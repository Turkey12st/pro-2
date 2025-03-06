
-- Add ID column to company_documents table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'company_documents' AND column_name = 'id'
    ) THEN
        ALTER TABLE company_documents 
        ADD COLUMN id uuid DEFAULT gen_random_uuid() NOT NULL;
    END IF;
END $$;
