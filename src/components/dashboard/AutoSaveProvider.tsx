
import React, { createContext, useContext, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutoSaveContextType {
  saveData: (tableName: string, data: any, id?: string) => Promise<boolean>;
  saveFormData: (formType: string, data: any) => Promise<boolean>;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

export function AutoSaveProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const saveData = useCallback(async (tableName: string, data: any, id?: string): Promise<boolean> => {
    try {
      let result;
      
      if (id) {
        // Update existing record
        result = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id);
      } else {
        // Insert new record
        result = await supabase
          .from(tableName)
          .insert(data);
      }

      if (result.error) throw result.error;

      toast({
        title: "تم الحفظ تلقائياً",
        description: "تم حفظ البيانات بنجاح",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error('خطأ في الحفظ التلقائي:', error);
      toast({
        title: "خطأ في الحفظ التلقائي",
        description: "حدث خطأ أثناء محاولة حفظ البيانات",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const saveFormData = useCallback(async (formType: string, data: any): Promise<boolean> => {
    try {
      const userId = 'demo-user-id'; // في التطبيق الحقيقي، استخدم معرف المستخدم المصادق عليه
      
      const { error } = await supabase
        .from('auto_saves')
        .upsert(
          {
            user_id: userId,
            form_type: formType,
            form_data: data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, form_type' }
        );
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('خطأ في حفظ بيانات النموذج:', error);
      return false;
    }
  }, []);

  return (
    <AutoSaveContext.Provider value={{ saveData, saveFormData }}>
      {children}
    </AutoSaveContext.Provider>
  );
}

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }
  return context;
}
