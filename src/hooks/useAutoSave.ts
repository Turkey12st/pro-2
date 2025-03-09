
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseAutoSaveProps {
  formType: string;
  initialData?: unknown;
  debounceMs?: number;
}

const useAutoSave = <T extends object>({ formType, initialData, debounceMs = 2000 }: UseAutoSaveProps) => {
  const [formData, setFormData] = useState<T>(initialData as T || {} as T);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const { toast } = useToast();

  const saveData = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real app, we'd use the authenticated user's ID
      const userId = 'demo-user-id'; 
      
      const { data, error } = await supabase
        .from('auto_saves')
        .upsert(
          {
            user_id: userId,
            form_type: formType,
            form_data: formData as any,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, form_type' }
        );
      
      if (error) throw error;
      
      // Update last saved timestamp
      const now = new Date();
      setLastSaved(now.toLocaleTimeString());
      
      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: 'خطأ في حفظ البيانات',
        description: 'حدث خطأ أثناء محاولة حفظ البيانات تلقائيًا.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, formType, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(formData as object).length > 0) {
        saveData();
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, debounceMs, saveData]);

  return {
    formData,
    setFormData,
    isLoading,
    saveData,
    lastSaved,
  };
};

export default useAutoSave;
