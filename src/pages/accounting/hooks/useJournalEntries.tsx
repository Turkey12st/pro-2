
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { JournalEntry } from "@/types/database";

export const useJournalEntries = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchJournalEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error("خطأ في جلب القيود:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب البيانات. تحقق من الاتصال بالإنترنت",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف القيد بنجاح" });
      setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء محاولة الحذف",
      });
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  return {
    journalEntries,
    isLoading,
    fetchJournalEntries,
    handleDeleteEntry,
  };
};
