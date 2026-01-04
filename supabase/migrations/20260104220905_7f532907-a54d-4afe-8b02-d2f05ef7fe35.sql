-- Enable RLS on remaining tables without it
ALTER TABLE IF EXISTS public.example_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sponsorship_transfer_fees ENABLE ROW LEVEL SECURITY;

-- Create storage buckets for secure file storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-photos', 'employee-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-files', 'employee-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Create RLS policies for documents bucket (financial/accounting staff)
CREATE POLICY "Financial staff can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'finance_manager', 'hr_manager')
  )
);

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Financial staff can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'finance_manager')
  )
);

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Create RLS policies for employee documents buckets
CREATE POLICY "HR staff can view employee documents"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('employee-documents', 'employee-photos', 'employee-files')
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'hr_manager', 'hr_officer')
  )
);

CREATE POLICY "HR staff can upload employee files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('employee-documents', 'employee-photos', 'employee-files')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "HR managers can update employee files"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('employee-documents', 'employee-photos', 'employee-files')
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'hr_manager')
  )
);

CREATE POLICY "Admins can delete employee files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('employee-documents', 'employee-photos', 'employee-files')
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- RLS policies for example_table (if it needs any)
CREATE POLICY "Authenticated users can access example_table"
ON public.example_table FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for sponsorship_transfer_fees (HR data)
CREATE POLICY "HR staff can manage sponsorship_transfer_fees"
ON public.sponsorship_transfer_fees FOR ALL
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'hr_manager', 'finance_manager')
  )
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner', 'hr_manager', 'finance_manager')
  )
);