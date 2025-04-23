
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry, ChartOfAccount } from "@/types/database";
import { calculateTotals, validateJournalEntry } from "@/utils/journalEntryHelpers";
import { format } from "date-fns";
import { Loader2, Plus, Trash } from "lucide-react";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";

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
    amount: initialData?.amount || 0,
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

  // تحديث إجمالي المدين والدائن عند تغيير بنود القيد
  useEffect(() => {
    // حساب الإجماليات من بنود القيد
    const totalDebit = entryLines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = entryLines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    
    setFormData(prev => ({ 
      ...prev, 
      total_debit: totalDebit, 
      total_credit: totalCredit 
    }));
    
    // التحقق من توازن القيد
    setIsBalanced(Math.abs(totalDebit - totalCredit) < 0.001);
  }, [entryLines]);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleEntryLineChange = (index: number, field: keyof EntryLine, value: string | number) => {
    const updatedLines = [...entryLines];
    updatedLines[index] = { 
      ...updatedLines[index], 
      [field]: field === 'account_id' ? value : Number(value) 
    };
    
    // إذا تم تغيير الحساب، ابحث عن رقم الحساب وأضفه
    if (field === 'account_id' && typeof value === 'string') {
      const selectedAccount = accounts.find(acc => acc.id === value);
      if (selectedAccount) {
        updatedLines[index].account_number = selectedAccount.account_number;
      }
    }
    
    setEntryLines(updatedLines);
  };
  
  const addEntryLine = () => {
    setEntryLines([...entryLines, { account_id: "", debit: 0, credit: 0 }]);
  };
  
  const removeEntryLine = (index: number) => {
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
    
    const errors = validateJournalEntry(formData);
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: errors.join(', '),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let journalEntryId: string;
      
      // تأكد من أن الحقول المطلوبة متوفرة في الكائن
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
        // تحديث قيد موجود
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
        
        // حذف البنود السابقة
        await supabase
          .from("journal_entry_items")
          .delete()
          .eq("journal_entry_id", journalEntryId);
      } else {
        // إضافة قيد جديد
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
      
      // إضافة بنود القيد
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
      
      // جلب القيد المحاسبي المحدث
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
    // عرض الحسابات النشطة فقط والمستوى الأدنى (ليس لها أطفال)
    acc.is_active && !accounts.some(child => child.parent_account_id === acc.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entry_name">اسم القيد</Label>
        <Input
          id="entry_name"
          name="entry_name"
          value={formData.entry_name}
          onChange={handleChange}
          placeholder="أدخل اسم القيد المحاسبي"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="أدخل وصف القيد المحاسبي"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry_date">التاريخ</Label>
          <Input
            id="entry_date"
            name="entry_date"
            type="date"
            value={formData.entry_date}
            onChange={handleChange}
            required
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="financial_statement_section">القائمة المالية</Label>
          <Select 
            value={formData.financial_statement_section} 
            onValueChange={(value) => handleSelectChange("financial_statement_section", value)}
          >
            <SelectTrigger id="financial_statement_section">
              <SelectValue placeholder="اختر القائمة المالية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income_statement">قائمة الدخل</SelectItem>
              <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
              <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">العملة</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => handleSelectChange("currency", value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="اختر العملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
              <SelectItem value="EUR">يورو (EUR)</SelectItem>
              <SelectItem value="GBP">جنيه إسترليني (GBP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exchange_rate">سعر الصرف</Label>
          <Input
            id="exchange_rate"
            name="exchange_rate"
            type="number"
            value={formData.exchange_rate}
            onChange={handleChange}
            placeholder="1.0"
            step="0.01"
            min="0.01"
            required
          />
        </div>
      </div>
      
      {/* بنود القيد المحاسبي */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">بنود القيد المحاسبي</h3>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className={`text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? 'القيد متوازن' : 'القيد غير متوازن'}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={addEntryLine}>
              <Plus className="h-4 w-4 ml-1" /> إضافة بند
            </Button>
          </div>
        </div>
        
        <div className="border rounded-md">
          {/* رأس الجدول */}
          <div className="grid grid-cols-12 gap-2 p-2 font-medium bg-muted">
            <div className="col-span-5">الحساب</div>
            <div className="col-span-2">البيان</div>
            <div className="col-span-2">مدين</div>
            <div className="col-span-2">دائن</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* بنود القيد */}
          {isLoadingAccounts ? (
            <div className="p-4 text-center">جاري تحميل الحسابات...</div>
          ) : (
            <>
              {entryLines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 border-t">
                  <div className="col-span-5">
                    <Select 
                      value={line.account_id} 
                      onValueChange={(value) => handleEntryLineChange(index, 'account_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_number} - {account.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={line.description || ''}
                      onChange={(e) => handleEntryLineChange(index, 'description', e.target.value)}
                      placeholder="البيان"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={line.debit || ''}
                      onChange={(e) => handleEntryLineChange(index, 'debit', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={line.credit || ''}
                      onChange={(e) => handleEntryLineChange(index, 'credit', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntryLine(index)}
                      disabled={entryLines.length <= 2}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* الإجمالي */}
              <div className="grid grid-cols-12 gap-2 p-2 border-t bg-muted font-medium">
                <div className="col-span-5 text-left">الإجمالي</div>
                <div className="col-span-2"></div>
                <div className="col-span-2">{formData.total_debit?.toFixed(2)}</div>
                <div className="col-span-2">{formData.total_credit?.toFixed(2)}</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* الفرق */}
              {!isBalanced && (
                <div className="grid grid-cols-12 gap-2 p-2 border-t text-red-600">
                  <div className="col-span-5 text-left">الفرق</div>
                  <div className="col-span-2"></div>
                  <div className="col-span-4">
                    {Math.abs((formData.total_debit || 0) - (formData.total_credit || 0)).toFixed(2)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
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
