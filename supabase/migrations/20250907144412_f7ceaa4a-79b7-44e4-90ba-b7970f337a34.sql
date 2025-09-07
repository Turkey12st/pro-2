-- Create employee_benefits table
CREATE TABLE IF NOT EXISTS public.employee_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    benefit_type TEXT NOT NULL,
    benefit_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by UUID
);

-- Enable RLS
ALTER TABLE public.employee_benefits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "HR staff can manage employee benefits" 
ON public.employee_benefits 
FOR ALL 
USING (has_role('admin'::text) OR has_role('owner'::text) OR has_role('hr_manager'::text));

-- Create indexes
CREATE INDEX idx_employee_benefits_employee_id ON public.employee_benefits(employee_id);
CREATE INDEX idx_employee_benefits_active ON public.employee_benefits(is_active);