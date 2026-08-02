GRANT SELECT ON public.violation_types TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.violation_types TO authenticated;
GRANT ALL ON public.violation_types TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_files TO authenticated;
GRANT ALL ON public.attendance_files TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capital_movements TO authenticated;
GRANT ALL ON public.capital_movements TO service_role;

CREATE POLICY "violation_types_select" ON public.violation_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "violation_types_manage" ON public.violation_types FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

CREATE POLICY "attendance_files_select" ON public.attendance_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendance_files_insert" ON public.attendance_files FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "attendance_files_update" ON public.attendance_files FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']))
  WITH CHECK (created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));
CREATE POLICY "attendance_files_delete" ON public.attendance_files FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin','owner','hr_manager']));

CREATE POLICY "capital_movements_select" ON public.capital_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "capital_movements_manage" ON public.capital_movements FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant']))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','owner','accountant']));