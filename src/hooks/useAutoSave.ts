
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAutoSave<T>({
  formType,
  initialData = {} as T,
  debounceMs = 3000,
}: {
  formType: string;
  initialData?: T;
  debounceMs?: number;
}) {
  const [formData, setFormData] = useState<T>(initialData as T);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { toast } = useToast();

  const saveData = useCallback(async (data: T) => {
    setIsLoading(true);
    try {
      // التحقق من البيانات الموجودة قبل الحفظ
      const { data: existingData, error: fetchError } = await supabase
        .from("auto_saves")
        .select("*")
        .eq("form_type", formType)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      const now = new Date().toISOString();
      
      // إنشاء أو تحديث السجل
      const { error: upsertError } = await supabase
        .from("auto_saves")
        .upsert(
          {
            form_type: formType,
            form_data: data as any,
            updated_at: now,
            user_id: "system", // استبدل بمعرف المستخدم الفعلي إذا كان لديك نظام مصادقة
          },
          { onConflict: "form_type,user_id" }
        );

      if (upsertError) throw upsertError;
      
      setLastSaved(now);
      return true;
    } catch (error) {
      console.error("Error saving form data:", error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: "لم نتمكن من حفظ البيانات تلقائيًا، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formType, toast]);

  const manualSave = async () => {
    const result = await saveData(formData);
    if (result) {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ البيانات بنجاح",
      });
    }
    return result;
  };

  useEffect(() => {
    const loadSavedData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("auto_saves")
          .select("form_data, updated_at")
          .eq("form_type", formType)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data?.form_data) {
          setFormData(data.form_data as T);
          if (data.updated_at) {
            setLastSaved(data.updated_at);
          }
        } else {
          setFormData(initialData as T);
        }
      } catch (error) {
        console.error("Error loading saved form data:", error);
        setFormData(initialData as T);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [formType, initialData]);

  useEffect(() => {
    let debounceTimeout: ReturnType<typeof setTimeout>;

    if (Object.keys(formData).length > 0 && JSON.stringify(formData) !== JSON.stringify(initialData)) {
      debounceTimeout = setTimeout(() => {
        saveData(formData);
      }, debounceMs);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [formData, debounceMs, saveData, initialData]);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    
    try {
      const date = new Date(lastSaved);
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return lastSaved;
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    saveData: manualSave,
    lastSaved: formatLastSaved()
  };
}
