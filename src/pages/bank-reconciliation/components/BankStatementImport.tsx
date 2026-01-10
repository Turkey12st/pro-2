import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { importFromCSV } from "@/utils/exportHelpers";
import { useBankAccounts } from "../hooks/useBankAccounts";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
}

export default function BankStatementImport() {
  const { toast } = useToast();
  const { bankAccounts, isLoading: accountsLoading } = useBankAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const parseCSVData = useCallback((data: Record<string, any>[]): ParsedTransaction[] => {
    return data.map(row => {
      // محاولة تحديد أعمدة التاريخ والمبلغ والوصف
      const dateKeys = ['date', 'تاريخ', 'Date', 'transaction_date', 'التاريخ', 'Value Date'];
      const descKeys = ['description', 'وصف', 'Description', 'الوصف', 'Narrative', 'Details'];
      const amountKeys = ['amount', 'مبلغ', 'Amount', 'المبلغ', 'Value'];
      const creditKeys = ['credit', 'دائن', 'Credit', 'إيداع'];
      const debitKeys = ['debit', 'مدين', 'Debit', 'سحب'];
      const refKeys = ['reference', 'مرجع', 'Reference', 'Ref', 'رقم المرجع'];

      const findValue = (keys: string[]) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
          }
        }
        return null;
      };

      const dateValue = findValue(dateKeys) || '';
      const description = findValue(descKeys) || '';
      const reference = findValue(refKeys) || '';
      
      // تحديد نوع المعاملة والمبلغ
      let amount = 0;
      let type: 'credit' | 'debit' = 'debit';
      
      const creditValue = parseFloat(String(findValue(creditKeys) || '0').replace(/[^0-9.-]/g, ''));
      const debitValue = parseFloat(String(findValue(debitKeys) || '0').replace(/[^0-9.-]/g, ''));
      const amountValue = parseFloat(String(findValue(amountKeys) || '0').replace(/[^0-9.-]/g, ''));

      if (creditValue > 0) {
        amount = creditValue;
        type = 'credit';
      } else if (debitValue > 0) {
        amount = debitValue;
        type = 'debit';
      } else if (amountValue !== 0) {
        amount = Math.abs(amountValue);
        type = amountValue > 0 ? 'credit' : 'debit';
      }

      return {
        date: dateValue,
        description: String(description),
        amount,
        type,
        reference: reference ? String(reference) : undefined
      };
    }).filter(t => t.amount > 0);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    try {
      const data = await importFromCSV(file);
      const transactions = parseCSVData(data);
      
      if (transactions.length === 0) {
        toast({
          variant: "destructive",
          title: "لم يتم العثور على معاملات",
          description: "تأكد من أن الملف يحتوي على بيانات صحيحة"
        });
        return;
      }

      setParsedTransactions(transactions);
      toast({
        title: "تم تحليل الملف",
        description: `تم العثور على ${transactions.length} معاملة`
      });
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        variant: "destructive",
        title: "خطأ في قراءة الملف",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع"
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!selectedAccount) {
      toast({
        variant: "destructive",
        title: "اختر حساباً بنكياً",
        description: "يجب اختيار الحساب البنكي قبل الاستيراد"
      });
      return;
    }

    if (parsedTransactions.length === 0) {
      toast({
        variant: "destructive",
        title: "لا توجد معاملات",
        description: "قم بتحميل ملف كشف الحساب أولاً"
      });
      return;
    }

    setIsImporting(true);

    try {
      const account = bankAccounts.find(a => a.id === selectedAccount);
      if (!account) throw new Error("الحساب البنكي غير موجود");

      // إنشاء دفعة استيراد
      const { data: batch, error: batchError } = await supabase
        .from('import_batches')
        .insert({
          company_id: account.company_id,
          bank_account_id: selectedAccount,
          file_name: fileName,
          file_type: 'csv',
          total_records: parsedTransactions.length,
          pending_records: parsedTransactions.length,
          matched_records: 0,
          status: 'processing'
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // إدخال المعاملات
      const transactions = parsedTransactions.map(t => ({
        bank_account_id: selectedAccount,
        company_id: account.company_id,
        transaction_date: t.date,
        description: t.description,
        amount: t.type === 'debit' ? -t.amount : t.amount,
        transaction_type: t.type,
        reference: t.reference || null,
        import_batch_id: batch.id,
        status: 'pending' as const,
        raw_data: { date: t.date, description: t.description, amount: t.amount, type: t.type, reference: t.reference || null }
      }));

      const { error: transError } = await supabase
        .from('bank_transactions')
        .insert(transactions);

      if (transError) throw transError;

      // تحديث حالة الدفعة
      await supabase
        .from('import_batches')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', batch.id);

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${parsedTransactions.length} معاملة`
      });

      setParsedTransactions([]);
      setFileName("");
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            تحميل كشف الحساب البنكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الحساب البنكي</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب البنكي" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ملف كشف الحساب (CSV)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading || accountsLoading}
                  className="flex-1"
                />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            </div>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{fileName}</span>
              <Badge variant="outline">{parsedTransactions.length} معاملة</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedTransactions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">معاينة المعاملات</CardTitle>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ml-2" />
                  استيراد المعاملات
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المرجع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedTransactions.slice(0, 20).map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{t.date}</TableCell>
                      <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono">
                        {t.amount.toLocaleString('ar-SA')} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'credit' ? 'default' : 'destructive'}>
                          {t.type === 'credit' ? 'إيداع' : 'سحب'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.reference || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedTransactions.length > 20 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  ... و {parsedTransactions.length - 20} معاملة أخرى
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
