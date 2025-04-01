
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseAutoSaveProps {
  formType: string;
  initialData?: Record<string, any> | null;
  debounceMs?: number;
}

const useAutoSave = <T extends Record<string, any>>({ 
  formType, 
  initialData, 
  debounceMs = 2000 
}: UseAutoSaveProps) => {
  const [formData, setFormData] = useState<T>(initialData as T || {} as T);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const { toast } = useToast();

  const saveData = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // في تطبيق حقيقي، سنستخدم معرف المستخدم المصادق عليه
      const userId = 'demo-user-id'; 
      
      const { error } = await supabase
        .from('auto_saves')
        .upsert(
          {
            user_id: userId,
            form_type: formType,
            form_data: formData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, form_type' }
        );
      
      if (error) throw error;
      
      // تحديث طابع الوقت للحفظ الأخير
      const now = new Date();
      setLastSaved(now.toLocaleTimeString());
      
      return true;
    } catch (error) {
      console.error('خطأ في حفظ بيانات النموذج:', error);
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
    // تأكد من وجود بيانات قبل محاولة الحفظ
    if (Object.keys(formData).length === 0) return;
    
    const timer = setTimeout(() => {
      saveData();
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
