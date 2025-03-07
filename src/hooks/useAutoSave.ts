
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAutoSave<T>({
  formType,
  initialData = {},
  debounceMs = 3000,
}: {
  formType: string;
  initialData?: T;
  debounceMs?: number;
}) {
  const [formData, setFormData] = useState<T>(initialData as T);
  const [isLoading, setIsLoading] = useState(false);
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

      // إنشاء أو تحديث السجل
      const { error: upsertError } = await supabase
        .from("auto_saves")
        .upsert(
          {
            form_type: formType,
            form_data: data as any,
            updated_at: new Date().toISOString(),
            user_id: "system", // استبدل بمعرف المستخدم الفعلي إذا كان لديك نظام مصادقة
          },
          { onConflict: "form_type,user_id" }
        );

      if (upsertError) throw upsertError;

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

  useEffect(() => {
    const loadSavedData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("auto_saves")
          .select("form_data")
          .eq("form_type", formType)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data?.form_data) {
          setFormData(data.form_data as T);
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

    if (Object.keys(formData).length > 0) {
      debounceTimeout = setTimeout(() => {
        saveData(formData);
      }, debounceMs);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [formData, debounceMs, saveData]);

  return {
    formData,
    setFormData,
    isLoading,
    saveData
  };
}
