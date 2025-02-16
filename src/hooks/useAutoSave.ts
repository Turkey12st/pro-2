
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';
import { useToast } from './use-toast';

export function useAutoSave<T>({ 
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
          .single();

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

      const { error } = await supabase
        .from('auto_saves')
        .upsert({
          user_id: user.id,
          form_type: formType,
          form_data: formData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_type'
        });

      if (error) throw error;

      toast({
        description: "تم حفظ البيانات تلقائياً",
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
    debounce((formData: T) => saveData(formData), 1000),
    [saveData]
  );

  useEffect(() => {
    if (!isLoading && data) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, isLoading]);

  return { isLoading };
}
