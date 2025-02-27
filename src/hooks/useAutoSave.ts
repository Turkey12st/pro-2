
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';
import { useToast } from './use-toast';

export function useAutoSave<T extends Record<string, any>>({ 
  formType, 
  data, 
  onLoad 
}: { 
  formType: string;
  data: T;
  onLoad: (data: T) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: savedData, error } = await supabase
          .from('auto_saves')
          .select('form_data')
          .eq('user_id', user.id)
          .eq('form_type', formType)
          .maybeSingle();

        if (error) throw error;
        if (savedData) {
          onLoad(savedData.form_data as T);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [formType, onLoad]);

  // Save data
  const saveData = useCallback(async (formData: T) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Comprobar primero si ya existe un registro
      const { data: existingRecord, error: queryError } = await supabase
        .from('auto_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .maybeSingle();

      if (queryError) throw queryError;

      if (existingRecord) {
        // Actualizar el registro existente
        const { error: updateError } = await supabase
          .from('auto_saves')
          .update({
            form_data: formData as any,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('form_type', formType);

        if (updateError) throw updateError;
      } else {
        // Insertar un nuevo registro
        const { error: insertError } = await supabase
          .from('auto_saves')
          .insert({
            user_id: user.id,
            form_type: formType,
            form_data: formData as any,
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      toast({
        description: "تم حفظ البيانات تلقائياً",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ التلقائي",
        description: "حدث خطأ أثناء حفظ البيانات",
      });
    }
  }, [formType, toast]);

  // Debounced save
  const debouncedSave = useCallback(
    debounce((formData: T) => saveData(formData), 2000),
    [saveData]
  );

  useEffect(() => {
    if (!isLoading && data) {
      debouncedSave(data);
    }
    
    return () => {
      debouncedSave.flush();
    };
  }, [data, debouncedSave, isLoading]);

  return { isLoading };
}
