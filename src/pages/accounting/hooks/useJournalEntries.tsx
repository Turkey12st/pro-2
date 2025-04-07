
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
      
      if (data) {
        // Map database fields to our JournalEntry interface
        const mappedEntries: JournalEntry[] = data.map(entry => ({
          id: entry.id,
          description: entry.description || "",
          amount: entry.amount || 0,
          date: entry.entry_date || entry.created_at.split('T')[0],
          status: entry.status || "draft",
          reference_no: entry.reference_number || "",
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          // Additional fields from our database
          entry_date: entry.entry_date,
          entry_name: entry.entry_name,
          entry_type: entry.entry_type,
          financial_statement_section: entry.financial_statement_section,
          total_debit: entry.total_debit,
          total_credit: entry.total_credit,
          attachment_url: entry.attachment_url
        }));
        
        setJournalEntries(mappedEntries);
      }
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
      // تأكد من وجود الحقول المطلوبة
      if (!entry.description || !entry.entry_date) {
        throw new Error("الوصف والتاريخ مطلوبان");
      }
      
      const entryToAdd = {
        description: entry.description,
        entry_date: entry.entry_date,
        entry_name: entry.entry_name,
        amount: entry.amount,
        entry_type: entry.entry_type || 'income',
        financial_statement_section: entry.financial_statement_section,
        total_debit: entry.total_debit || 0,
        total_credit: entry.total_credit || 0,
        reference_number: entry.reference_no || "",
        status: entry.status || "draft"
      };
      
      const { data, error } = await supabase
        .from("journal_entries")
        .insert(entryToAdd)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map the returned data to our JournalEntry interface
        const newEntry: JournalEntry = {
          id: data[0].id,
          description: data[0].description || "",
          amount: data[0].amount || 0,
          date: data[0].entry_date || data[0].created_at.split('T')[0],
          status: data[0].status || "draft",
          reference_no: data[0].reference_number || "",
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          // Additional fields
          entry_date: data[0].entry_date,
          entry_name: data[0].entry_name,
          entry_type: data[0].entry_type,
          financial_statement_section: data[0].financial_statement_section,
          total_debit: data[0].total_debit,
          total_credit: data[0].total_credit
        };
        
        setJournalEntries([newEntry, ...journalEntries]);
        return newEntry;
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
      // تأكد من أن التحديثات تحتوي على الحقول المطلوبة إذا كانت متضمنة
      if (updates.description === "") {
        throw new Error("لا يمكن أن يكون الوصف فارغًا");
      }
      
      if (updates.entry_date === "") {
        throw new Error("التاريخ مطلوب");
      }
      
      // إنشاء كائن التحديث مع فقط الحقول المتوفرة
      const updateData: Record<string, any> = {};
      
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.entry_date !== undefined) updateData.entry_date = updates.entry_date;
      if (updates.entry_name !== undefined) updateData.entry_name = updates.entry_name;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.entry_type !== undefined) updateData.entry_type = updates.entry_type;
      if (updates.financial_statement_section !== undefined) updateData.financial_statement_section = updates.financial_statement_section;
      if (updates.total_debit !== undefined) updateData.total_debit = updates.total_debit;
      if (updates.total_credit !== undefined) updateData.total_credit = updates.total_credit;
      if (updates.reference_no !== undefined) updateData.reference_number = updates.reference_no;
      if (updates.status !== undefined) updateData.status = updates.status;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map the returned data to our JournalEntry interface
        const updatedEntry: JournalEntry = {
          id: data[0].id,
          description: data[0].description || "",
          amount: data[0].amount || 0,
          date: data[0].entry_date || data[0].created_at.split('T')[0],
          status: data[0].status || "draft",
          reference_no: data[0].reference_number || "",
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          // Additional fields
          entry_date: data[0].entry_date,
          entry_name: data[0].entry_name,
          entry_type: data[0].entry_type,
          financial_statement_section: data[0].financial_statement_section,
          total_debit: data[0].total_debit,
          total_credit: data[0].total_credit
        };
        
        setJournalEntries(
          journalEntries.map(entry => 
            entry.id === id ? updatedEntry : entry
          )
        );
        
        return updatedEntry;
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
