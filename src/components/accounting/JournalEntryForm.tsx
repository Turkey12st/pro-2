
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from "@/types/database";
import { validateJournalEntry } from "@/utils/journalEntryHelpers";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";
import { JournalEntryHeader } from "./JournalEntryHeader";
import { JournalEntryLines } from "./JournalEntryLines";

interface JournalEntryFormProps {
  initialData?: Partial<JournalEntry>;
  onSuccess: (data: JournalEntry) => void;
  onClose: () => void;
}

interface EntryLine {
  id?: string;
  account_id: string;
  account_number?: string;
  description?: string;
  debit: number;
  credit: number;
}

export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  const { toast } = useToast();
  const { accounts, isLoading: isLoadingAccounts } = useChartOfAccounts();
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    description: initialData?.description || "",
    entry_name: initialData?.entry_name || "",
    entry_type: initialData?.entry_type || "income",
    financial_statement_section: initialData?.financial_statement_section || "income_statement",
    entry_date: initialData?.entry_date || format(new Date(), "yyyy-MM-dd"),
    total_debit: initialData?.total_debit || 0,
    total_credit: initialData?.total_credit || 0,
    currency: initialData?.currency || "SAR",
    exchange_rate: initialData?.exchange_rate || 1.0,
  });
  
  const [entryLines, setEntryLines] = useState<EntryLine[]>([
    { account_id: "", debit: 0, credit: 0 },
    { account_id: "", debit: 0, credit: 0 }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBalanced, setIsBalanced] = useState(true);

  // تحميل بنود القيد عند التعديل
  useEffect(() => {
    const fetchEntryLines = async () => {
      if (initialData?.id) {
        try {
          const { data, error } = await supabase
            .from("journal_entry_items")
            .select("*")
            .eq("journal_entry_id", initialData.id)
            .order("id");
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            setEntryLines(data);
          }
        } catch (err) {
          console.error("خطأ في جلب بنود القيد:", err);
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "فشل في جلب بنود القيد المحاسبي",
          });
        }
      }
    };
    
    fetchEntryLines();
  }, [initialData?.id, toast]);

  // تحديث إجمالي المدين والدائن عند تغيير بنود القيد
  useEffect(() => {
    const totalDebit = entryLines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = entryLines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    
    setFormData(prev => ({ 
      ...prev, 
      total_debit: totalDebit, 
      total_credit: totalCredit 
    }));
    
    setIsBalanced(Math.abs(totalDebit - totalCredit) < 0.001);
  }, [entryLines]);

  const handleChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleEntryLineChange = (index: number, field: keyof EntryLine, value: string | number) => {
    const updatedLines = [...entryLines];
    updatedLines[index] = { 
      ...updatedLines[index], 
      [field]: field === 'account_id' ? value : Number(value) 
    };
    
    if (field === 'account_id' && typeof value === 'string') {
      const selectedAccount = accounts.find(acc => acc.id === value);
      if (selectedAccount) {
        updatedLines[index].account_number = selectedAccount.account_number;
      }
    }
    
    setEntryLines(updatedLines);
  };
  
  const handleAddLine = () => {
    setEntryLines([...entryLines, { account_id: "", debit: 0, credit: 0 }]);
  };
  
  const handleRemoveLine = (index: number) => {
    if (entryLines.length <= 2) {
      toast({
        variant: "destructive",
        title: "لا يمكن الحذف",
        description: "يجب أن يحتوي القيد على بندين على الأقل",
      });
      return;
    }
    
    const updatedLines = entryLines.filter((_, i) => i !== index);
    setEntryLines(updatedLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBalanced) {
      toast({
        variant: "destructive",
        title: "القيد غير متوازن",
        description: "مجموع المدين يجب أن يساوي مجموع الدائن",
      });
      return;
    }
    
    if (entryLines.some(line => !line.account_id)) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يجب تحديد الحساب لكل بند",
      });
      return;
    }
    
    if (!formData.description || !formData.entry_name) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يجب إدخال اسم القيد والوصف",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let journalEntryId: string;
      
      const entryData = {
        description: formData.description || "",
        entry_date: formData.entry_date || "",
        entry_name: formData.entry_name,
        financial_statement_section: formData.financial_statement_section,
        total_debit: formData.total_debit,
        total_credit: formData.total_credit,
        currency: formData.currency,
        exchange_rate: formData.exchange_rate,
      };
      
      if (initialData?.id) {
        const { data, error } = await supabase
          .from("journal_entries")
          .update(entryData)
          .eq("id", initialData.id)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error("لم يتم العثور على القيد المحاسبي");
        }
        
        journalEntryId = initialData.id;
        
        await supabase
          .from("journal_entry_items")
          .delete()
          .eq("journal_entry_id", journalEntryId);
      } else {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert(entryData)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error("فشل في إنشاء القيد المحاسبي");
        }
        
        journalEntryId = data[0].id;
      }
      
      const entryItemsData = entryLines.map(line => ({
        journal_entry_id: journalEntryId,
        account_id: line.account_id,
        account_number: line.account_number,
        description: line.description || "",
        debit: line.debit || 0,
        credit: line.credit || 0,
      }));
      
      const { error: itemsError } = await supabase
        .from("journal_entry_items")
        .insert(entryItemsData);
        
      if (itemsError) throw itemsError;
      
      const { data: updatedEntry, error: fetchError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", journalEntryId)
        .single();
        
      if (fetchError) throw fetchError;
      
      toast({
        title: initialData?.id ? "تم التعديل" : "تم الإضافة",
        description: `تم ${initialData?.id ? "تعديل" : "إضافة"} القيد بنجاح`,
      });
      
      onSuccess(updatedEntry as JournalEntry);
    } catch (error) {
      console.error("خطأ:", error);
      toast({
        variant: "destructive",
        title: "فشل في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تصفية الحسابات للعرض في القائمة المنسدلة
  const filteredAccounts = accounts.filter(acc => 
    acc.is_active && !accounts.some(child => child.parent_account_id === acc.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <JournalEntryHeader
        formData={formData}
        onChange={handleChange}
      />
      
      <JournalEntryLines
        entryLines={entryLines}
        accounts={filteredAccounts}
        isBalanced={isBalanced}
        totalDebit={formData.total_debit || 0}
        totalCredit={formData.total_credit || 0}
        onLineChange={handleEntryLineChange}
        onAddLine={handleAddLine}
        onRemoveLine={handleRemoveLine}
      />
      
      <div className="flex justify-end space-x-2 space-x-reverse mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isBalanced || isLoadingAccounts}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : initialData?.id ? (
            "تحديث القيد"
          ) : (
            "إضافة القيد"
          )}
        </Button>
      </div>
    </form>
  );
}
