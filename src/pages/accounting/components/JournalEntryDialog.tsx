
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { X, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface JournalEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingEntry: JournalEntry | null;
  onSuccess: () => void;
}

interface JournalEntryItem {
  id?: string;
  account_id: string;
  description?: string;
  debit: number;
  credit: number;
}

const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({
  isOpen,
  setIsOpen,
  editingEntry,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Main entry form state
  const [entryName, setEntryName] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [entryType, setEntryType] = useState("income");
  const [financialSection, setFinancialSection] = useState("income_statement");
  
  // Journal entry items (debits and credits)
  const [entryItems, setEntryItems] = useState<JournalEntryItem[]>([
    { account_id: "", description: "", debit: 0, credit: 0 },
    { account_id: "", description: "", debit: 0, credit: 0 },
  ]);
  
  // Totals
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);
  
  // Chart of accounts for selection
  const [accounts, setAccounts] = useState<{id: string, name: string}[]>([
    { id: "cash", name: "النقدية" },
    { id: "accounts_receivable", name: "ذمم مدينة" },
    { id: "inventory", name: "المخزون" },
    { id: "fixed_assets", name: "الأصول الثابتة" },
    { id: "accounts_payable", name: "ذمم دائنة" },
    { id: "loans", name: "القروض" },
    { id: "capital", name: "رأس المال" },
    { id: "revenue", name: "الإيرادات" },
    { id: "cogs", name: "تكلفة المبيعات" },
    { id: "expenses", name: "المصروفات" },
    { id: "salaries", name: "الرواتب" },
    { id: "rent", name: "الإيجارات" },
    { id: "utilities", name: "المرافق" },
  ]);
  
  // Reset form when dialog opens/closes or editing entry changes
  useEffect(() => {
    if (isOpen && editingEntry) {
      setEntryName(editingEntry.entry_name || "");
      setDescription(editingEntry.description || "");
      setEntryDate(editingEntry.entry_date || format(new Date(), "yyyy-MM-dd"));
      setEntryType(editingEntry.entry_type || "income");
      setFinancialSection(editingEntry.financial_statement_section || "income_statement");
      
      // Fetch entry items from database
      const fetchEntryItems = async () => {
        const { data, error } = await supabase
          .from("journal_entry_items")
          .select("*")
          .eq("journal_entry_id", editingEntry.id);
        
        if (error) {
          console.error("Error fetching entry items:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setEntryItems(data);
        }
      };
      
      fetchEntryItems();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, editingEntry]);
  
  // Calculate totals when entry items change
  useEffect(() => {
    const debitTotal = entryItems.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const creditTotal = entryItems.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
    
    setTotalDebit(debitTotal);
    setTotalCredit(creditTotal);
    setIsBalanced(debitTotal === creditTotal && debitTotal > 0);
  }, [entryItems]);
  
  const resetForm = () => {
    setEntryName("");
    setDescription("");
    setEntryDate(format(new Date(), "yyyy-MM-dd"));
    setEntryType("income");
    setFinancialSection("income_statement");
    setEntryItems([
      { account_id: "", description: "", debit: 0, credit: 0 },
      { account_id: "", description: "", debit: 0, credit: 0 },
    ]);
  };
  
  const updateEntryItem = (index: number, field: keyof JournalEntryItem, value: any) => {
    const newItems = [...entryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEntryItems(newItems);
  };
  
  const addEntryItem = () => {
    setEntryItems([...entryItems, { account_id: "", description: "", debit: 0, credit: 0 }]);
  };
  
  const removeEntryItem = (index: number) => {
    if (entryItems.length <= 2) {
      toast({
        title: "لا يمكن الحذف",
        description: "يجب أن يحتوي القيد على عنصرين على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    const newItems = entryItems.filter((_, i) => i !== index);
    setEntryItems(newItems);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entry
    if (!entryName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم القيد",
        variant: "destructive",
      });
      return;
    }
    
    if (!isBalanced) {
      toast({
        title: "القيد غير متوازن",
        description: "يجب أن يكون مجموع المدين يساوي مجموع الدائن",
        variant: "destructive",
      });
      return;
    }
    
    for (const item of entryItems) {
      if (!item.account_id) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار حساب لكل صف",
          variant: "destructive",
        });
        return;
      }
      
      if (item.debit === 0 && item.credit === 0) {
        toast({
          title: "خطأ",
          description: "يجب إدخال قيمة مدين أو دائن لكل صف",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Start a Supabase transaction
      let journalEntryId = editingEntry?.id;
      
      if (editingEntry) {
        // Update existing journal entry
        const { error } = await supabase
          .from("journal_entries")
          .update({
            entry_name: entryName,
            description: description,
            entry_date: entryDate,
            entry_type: entryType,
            financial_statement_section: financialSection,
            total_debit: totalDebit,
            total_credit: totalCredit,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingEntry.id);
        
        if (error) throw error;
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from("journal_entry_items")
          .delete()
          .eq("journal_entry_id", editingEntry.id);
        
        if (deleteError) throw deleteError;
      } else {
        // Create new journal entry
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            entry_name: entryName,
            description: description,
            entry_date: entryDate,
            entry_type: entryType,
            financial_statement_section: financialSection,
            total_debit: totalDebit,
            total_credit: totalCredit,
            amount: totalDebit, // Using debit total as amount for consistency
          })
          .select();
        
        if (error) throw error;
        journalEntryId = data[0].id;
      }
      
      // Insert all entry items
      if (journalEntryId) {
        const itemsToInsert = entryItems.map(item => ({
          journal_entry_id: journalEntryId,
          account_id: item.account_id,
          description: item.description,
          debit: item.debit || 0,
          credit: item.credit || 0,
        }));
        
        const { error: itemsError } = await supabase
          .from("journal_entry_items")
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }
      
      toast({
        title: editingEntry ? "تم تحديث القيد" : "تم إضافة القيد",
        description: editingEntry ? "تم تحديث القيد المحاسبي بنجاح" : "تم إضافة القيد المحاسبي بنجاح",
      });
      
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ القيد المحاسبي",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingEntry ? "تعديل قيد محاسبي" : "إضافة قيد محاسبي جديد"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل القيد المحاسبي وتأكد من توازن المدين والدائن
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="entries">تفاصيل القيد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryName">اسم القيد</Label>
                  <Input
                    id="entryName"
                    value={entryName}
                    onChange={(e) => setEntryName(e.target.value)}
                    placeholder="مثال: فاتورة مبيعات رقم 123"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entryDate">تاريخ القيد</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryType">نوع القيد</Label>
                  <Select value={entryType} onValueChange={setEntryType}>
                    <SelectTrigger id="entryType">
                      <SelectValue placeholder="اختر نوع القيد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">إيراد</SelectItem>
                      <SelectItem value="expense">مصروف</SelectItem>
                      <SelectItem value="asset">أصل</SelectItem>
                      <SelectItem value="liability">التزام</SelectItem>
                      <SelectItem value="equity">حقوق ملكية</SelectItem>
                      <SelectItem value="transfer">تحويل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="financialSection">القائمة المالية</Label>
                  <Select value={financialSection} onValueChange={setFinancialSection}>
                    <SelectTrigger id="financialSection">
                      <SelectValue placeholder="اختر القائمة المالية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income_statement">قائمة الدخل</SelectItem>
                      <SelectItem value="balance_sheet">قائمة المركز المالي</SelectItem>
                      <SelectItem value="cash_flow">قائمة التدفقات النقدية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف القيد</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف تفصيلي للقيد المحاسبي"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="entries" className="pt-4">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-right">الحساب</th>
                          <th className="pb-2 text-right">الوصف</th>
                          <th className="pb-2 text-right">مدين</th>
                          <th className="pb-2 text-right">دائن</th>
                          <th className="pb-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {entryItems.map((item, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-2 pr-2">
                              <Select
                                value={item.account_id}
                                onValueChange={(value) => updateEntryItem(index, "account_id", value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="اختر الحساب" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                      {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                value={item.description || ""}
                                onChange={(e) => updateEntryItem(index, "description", e.target.value)}
                                placeholder="وصف (اختياري)"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                value={item.debit || ""}
                                onChange={(e) => {
                                  updateEntryItem(index, "debit", Number(e.target.value) || 0);
                                  if (Number(e.target.value) > 0) {
                                    updateEntryItem(index, "credit", 0);
                                  }
                                }}
                                dir="ltr"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                value={item.credit || ""}
                                onChange={(e) => {
                                  updateEntryItem(index, "credit", Number(e.target.value) || 0);
                                  if (Number(e.target.value) > 0) {
                                    updateEntryItem(index, "debit", 0);
                                  }
                                }}
                                dir="ltr"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-2 pl-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntryItem(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-medium">
                          <td colSpan={2} className="py-2 text-left">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addEntryItem}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" /> إضافة سطر
                            </Button>
                          </td>
                          <td className="py-2 text-right">
                            {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 text-right">
                            {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">حالة القيد: </p>
                    {isBalanced ? (
                      <p className="text-green-600 font-medium">متوازن ✓</p>
                    ) : (
                      <p className="text-red-600 font-medium">غير متوازن ✗</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">الفرق:</p>
                    <p className={totalDebit === totalCredit ? "text-green-600" : "text-red-600"}>
                      {Math.abs(totalDebit - totalCredit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || !isBalanced}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : editingEntry ? (
                "تحديث القيد"
              ) : (
                "إضافة القيد"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntryDialog;
