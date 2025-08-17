import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface defining the context type for the auto-save functionality.
 * @property {function} saveData - Function to save data to a specific table.
 * @property {function} saveFormData - Function to save form data using upsert.
 * @property {boolean} isSaving - A boolean to indicate if a save operation is in progress.
 */
interface AutoSaveContextType {
  saveData: (tableName: string, data: any, id?: string) => Promise<boolean>;
  saveFormData: (formType: string, data: any) => Promise<boolean>;
  isSaving: boolean;
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined);

/**
 * Provides a context for automatic saving functionality throughout the application.
 * It includes a debounced `saveData` function and a saving state.
 * @param {React.ReactNode} children - The child components to be wrapped by the provider.
 */
export function AutoSaveProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch the authenticated user ID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  /**
   * Saves data to a specified table with a built-in debounce mechanism.
   * This prevents excessive database calls during rapid user input.
   * @param {string} tableName - The name of the table to save data to.
   * @param {any} data - The data object to save.
   * @param {string} [id] - The ID of the record to update. If not provided, a new record is inserted.
   * @returns {Promise<boolean>} A promise that resolves to true on success or false on failure.
   */
  const saveData = useCallback(async (tableName: string, data: any, id?: string): Promise<boolean> => {
    // Clear any existing save timer to debounce the call
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Return a new Promise that resolves when the save operation completes
    return new Promise<boolean>((resolve) => {
      // Set saving state and show a toast
      setIsSaving(true);
      const savingToast = toast({
        title: "جاري الحفظ...",
        description: "يرجى الانتظار بينما يتم حفظ التغييرات.",
      });

      // Create a new timer to execute the save after a delay (e.g., 750ms)
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Define valid table names to prevent type errors
          const validTables = [
            'capital_management', 'employees', 'projects', 'clients',
            'company_partners', 'journal_entries', 'salary_records', 'auto_saves'
          ];
          
          if (!validTables.includes(tableName)) {
            console.warn(`Table ${tableName} not in valid tables list`);
            // Reset saving state and resolve the promise as false
            setIsSaving(false);
            resolve(false);
            return;
          }

          let result;
          
          if (id) {
            // Update existing record
            result = await supabase
              .from(tableName as any)
              .update(data)
              .eq('id', id);
          } else {
            // Insert new record
            result = await supabase
              .from(tableName as any)
              .insert(data);
          }

          if (result.error) throw result.error;

          // On success, update the toast and resolve the promise as true
          toast({
            id: savingToast.id,
            title: "تم الحفظ تلقائياً",
            description: "تم حفظ البيانات بنجاح",
            variant: "default",
          });
          resolve(true);

        } catch (error) {
          console.error('خطأ في الحفظ التلقائي:', error);
          // On error, update the toast and resolve the promise as false
          toast({
            id: savingToast.id,
            title: "خطأ في الحفظ التلقائي",
            description: "حدث خطأ أثناء محاولة حفظ البيانات",
            variant: "destructive",
          });
          resolve(false);
        } finally {
          // Ensure saving state is always set to false, regardless of success or failure
          setIsSaving(false);
        }
      }, 750); // Debounce delay
    });
  }, [toast]);

  /**
   * Saves form data using the upsert method for specific forms.
   * @param {string} formType - The type of the form.
   * @param {any} data - The form data object.
   * @returns {Promise<boolean>} A promise that resolves to true on success or false on failure.
   */
  const saveFormData = useCallback(async (formType: string, data: any): Promise<boolean> => {
    if (!userId) {
      console.error('User ID not available. Cannot save form data.');
      return false;
    }
    
    try {
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
  }, [userId]);

  return (
    <AutoSaveContext.Provider value={{ saveData, saveFormData, isSaving }}>
      {children}
    </AutoSaveContext.Provider>
  );
}

/**
 * Custom hook to use the auto-save context.
 * @returns {AutoSaveContextType} The context value.
 * @throws {Error} If used outside of an AutoSaveProvider.
 */
export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (context === undefined) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }
  return context;
}
