
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from "@/types/database";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";
import { JournalEntryHeader } from "./JournalEntryHeader";
import { JournalEntryLines } from "./JournalEntryLines";
import { usePermissions } from "@/hooks/usePermissions";
import { createAccountingEvent } from "@/services/accountingPostingService";

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
  const { companyId } = usePermissions();
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
  const sourceIdRef = useRef(crypto.randomUUID());
  const idempotencyKeyRef = useRef(crypto.randomUUID());

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
      if (!companyId) {
        throw new Error("لا توجد شركة نشطة مرتبطة بحسابك");
      }

      if (initialData?.id) {
        throw new Error("تعديل القيود يتم عبر طلب عكس أو مسار خادمي مخصص؛ لا يمكن تعديل القيد مباشرة");
      }

      const entryLabel = formData.entry_name || formData.description || "قيد يدوي";
      const eventResult = await createAccountingEvent({
        companyId,
        sourceType: "manual_journal",
        sourceId: sourceIdRef.current,
        eventType: "manual_journal_draft",
        entryDate: formData.entry_date || format(new Date(), "yyyy-MM-dd"),
        description: `${entryLabel}: ${formData.description || ""}`.trim(),
        currency: formData.currency || "SAR",
        idempotencyKey: idempotencyKeyRef.current,
        lines: entryLines.map((line) => ({
          account_id: line.account_id,
          description: line.description || "",
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          currency: formData.currency || "SAR",
          exchange_rate: Number(formData.exchange_rate) || 1,
        })),
      });

      const { data: createdEntry, error: fetchError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", eventResult.journal_entry_id)
        .single();

      if (fetchError || !createdEntry) {
        throw new Error(fetchError?.message || "تم إنشاء القيد لكن تعذر استرجاعه");
      }

      toast({
        title: "تم إنشاء مسودة القيد",
        description: "تم إنشاء القيد عبر محرك محاسبي خادمي آمن",
      });

      onSuccess(createdEntry as JournalEntry);
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
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
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
