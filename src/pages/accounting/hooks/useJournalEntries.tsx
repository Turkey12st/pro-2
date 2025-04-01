
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntry } from "@/types/database";

export const useJournalEntries = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchJournalEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (err) {
      console.error("خطأ في جلب القيود:", err);
      setError(err instanceof Error ? err : new Error('حدث خطأ غير معروف'));
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب البيانات. تحقق من الاتصال بالإنترنت",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف القيد بنجاح" });
      setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    } catch (err) {
      console.error("خطأ في الحذف:", err);
      toast({
        variant: "destructive",
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء محاولة الحذف",
      });
    }
  };

  const addJournalEntry = async (entry: Partial<JournalEntry>) => {
    try {
      // تأكد من أن entry ليس مصفوفة
      const { data, error } = await supabase
        .from("journal_entries")
        .insert(entry)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setJournalEntries([data[0] as JournalEntry, ...journalEntries]);
        return data[0] as JournalEntry;
      }
      
      return null;
    } catch (err) {
      console.error("خطأ في إضافة قيد:", err);
      toast({
        variant: "destructive",
        title: "فشل في الإضافة",
        description: "حدث خطأ أثناء محاولة إضافة قيد جديد",
      });
      throw err;
    }
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    try {
      // تأكد من أن updates ليس مصفوفة
      const { data, error } = await supabase
        .from("journal_entries")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setJournalEntries(
          journalEntries.map(entry => 
            entry.id === id ? { ...entry, ...data[0] } as JournalEntry : entry
          )
        );
        return data[0] as JournalEntry;
      }
      
      return null;
    } catch (err) {
      console.error("خطأ في تحديث قيد:", err);
      toast({
        variant: "destructive",
        title: "فشل في التحديث",
        description: "حدث خطأ أثناء محاولة تحديث القيد",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  return {
    journalEntries,
    isLoading,
    error,
    fetchJournalEntries,
    handleDeleteEntry,
    addJournalEntry,
    updateJournalEntry,
  };
};
