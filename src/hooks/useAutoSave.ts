
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAutoSave = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveData = async (formType: string, formData: any) => {
    setIsLoading(true);
    try {
      // Get user ID - in a real app, get this from auth
      const userId = "system"; // placeholder

      const { data, error } = await supabase
        .from('auto_saves')
        .upsert(
          {
            user_id: userId,
            form_type: formType,
            form_data: formData
          },
          {
            onConflict: 'user_id,form_type'
          }
        );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveData, isLoading };
};
