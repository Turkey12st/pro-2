
-- notifications
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Users can read notifications" ON public.notifications;
CREATE POLICY "notifications_select_staff" ON public.notifications FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant','sales_manager']));

-- tenders
DROP POLICY IF EXISTS "tenders_select_authenticated" ON public.tenders;
CREATE POLICY "tenders_select_staff" ON public.tenders FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner','sales_manager','project_manager','accountant']));

-- projects
DROP POLICY IF EXISTS "projects_select_auth" ON public.projects;
CREATE POLICY "projects_select_staff" ON public.projects FOR SELECT TO authenticated
USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['admin','owner','project_manager','accountant','sales_manager']));

-- company_documents
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_documents;
CREATE POLICY "company_documents_select_staff" ON public.company_documents FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant']));

-- attendance_files
DROP POLICY IF EXISTS "attendance_files_select" ON public.attendance_files;
CREATE POLICY "attendance_files_select_staff" ON public.attendance_files FOR SELECT TO authenticated
USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

-- attendance_automation_settings
DROP POLICY IF EXISTS "att_auto_select" ON public.attendance_automation_settings;
CREATE POLICY "att_auto_select_staff" ON public.attendance_automation_settings FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

-- data_sync_log
DROP POLICY IF EXISTS "auth_select_sync_log" ON public.data_sync_log;
CREATE POLICY "sync_log_select_admin" ON public.data_sync_log FOR SELECT TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner']));

-- allowance_types writes
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.allowance_types;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.allowance_types;
CREATE POLICY "allowance_types_insert_staff" ON public.allowance_types FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant']));
CREATE POLICY "allowance_types_update_staff" ON public.allowance_types FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant']))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager','accountant']));
