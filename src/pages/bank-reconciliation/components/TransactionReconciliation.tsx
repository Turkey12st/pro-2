import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link2, Check, X, Search, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBankAccounts } from "../hooks/useBankAccounts";

interface BankTransaction {
  id: string;
  transaction_date: string;
  description: string | null;
  amount: number;
  transaction_type: string | null;
  reference: string | null;
  status: 'pending' | 'matched' | 'manual' | 'ignored' | null;
  matched_journal_entry_id: string | null;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  total_debit: number | null;
  total_credit: number | null;
}

export default function TransactionReconciliation() {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
      fetchJournalEntries();
    }
  }, [selectedAccount]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('bank_transactions')
        .select('*')
        .eq('bank_account_id', selectedAccount)
        .order('transaction_date', { ascending: false });

      if (statusFilter !== 'all' && (statusFilter === 'pending' || statusFilter === 'matched' || statusFilter === 'manual' || statusFilter === 'ignored')) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب المعاملات",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const account = bankAccounts.find(a => a.id === selectedAccount);
      if (!account) return;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, entry_date, description, total_debit, total_credit')
        .eq('company_id', account.company_id)
        .order('entry_date', { ascending: false })
        .limit(200);

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    }
  };

  const handleAutoMatch = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    try {
      const pendingTxs = transactions.filter(t => t.status === 'pending');
      let matchedCount = 0;

      for (const tx of pendingTxs) {
        // مطابقة بناءً على المبلغ والتاريخ
        const matchingEntry = journalEntries.find(entry => {
          const entryAmount = Math.max(entry.total_debit || 0, entry.total_credit || 0);
          const txAmount = Math.abs(tx.amount);
          
          // مطابقة المبلغ (مع هامش 1%)
          const amountMatch = Math.abs(entryAmount - txAmount) <= txAmount * 0.01;
          
          // مطابقة التاريخ (±3 أيام)
          const txDate = new Date(tx.transaction_date);
          const entryDate = new Date(entry.entry_date);
          const daysDiff = Math.abs((txDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          const dateMatch = daysDiff <= 3;
          
          return amountMatch && dateMatch;
        });

        if (matchingEntry) {
          const { error } = await supabase
            .from('bank_transactions')
            .update({
              status: 'matched',
              matched_journal_entry_id: matchingEntry.id
            })
            .eq('id', tx.id);

          if (!error) matchedCount++;
        }
      }

      toast({
        title: "تمت المطابقة التلقائية",
        description: `تم مطابقة ${matchedCount} معاملة من ${pendingTxs.length}`
      });

      fetchTransactions();
    } catch (error) {
      console.error("Auto-match error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في المطابقة",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualMatch = async (entryId: string) => {
    if (!selectedTx) return;

    try {
      const { error } = await supabase
        .from('bank_transactions')
        .update({
          status: 'manual',
          matched_journal_entry_id: entryId
        })
        .eq('id', selectedTx.id);

      if (error) throw error;

      toast({ title: "تمت المطابقة", description: "تم ربط المعاملة بالقيد المحاسبي" });
      setMatchDialogOpen(false);
      setSelectedTx(null);
      fetchTransactions();
    } catch (error) {
      console.error("Match error:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    }
  };

  const handleIgnore = async (txId: string) => {
    try {
      const { error } = await supabase
        .from('bank_transactions')
        .update({ status: 'ignored' })
        .eq('id', txId);

      if (error) throw error;
      toast({ title: "تم التجاهل", description: "تم تجاهل المعاملة" });
      fetchTransactions();
    } catch (error) {
      console.error("Ignore error:", error);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-500">مطابق</Badge>;
      case 'manual':
        return <Badge className="bg-blue-500">يدوي</Badge>;
      case 'ignored':
        return <Badge variant="secondary">متجاهل</Badge>;
      default:
        return <Badge variant="outline">معلق</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            مطابقة المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
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

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="matched">مطابق</SelectItem>
                <SelectItem value="manual">يدوي</SelectItem>
                <SelectItem value="ignored">متجاهل</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleAutoMatch}
              disabled={!selectedAccount || isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 ml-2" />
              )}
              مطابقة تلقائية
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedAccount && (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد معاملات
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(tx.transaction_date).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell className={`whitespace-nowrap font-mono ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(tx.amount).toLocaleString('ar-SA')} ر.س
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          {tx.status === 'pending' && (
                            <div className="flex gap-1">
                              <Dialog open={matchDialogOpen && selectedTx?.id === tx.id} onOpenChange={(open) => {
                                setMatchDialogOpen(open);
                                if (!open) setSelectedTx(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedTx(tx)}
                                  >
                                    <Link2 className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>اختر القيد المحاسبي</DialogTitle>
                                  </DialogHeader>
                                  <div className="max-h-96 overflow-y-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>التاريخ</TableHead>
                                          <TableHead>الوصف</TableHead>
                                          <TableHead>المبلغ</TableHead>
                                          <TableHead></TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {journalEntries.map(entry => (
                                          <TableRow key={entry.id}>
                                            <TableCell>
                                              {new Date(entry.entry_date).toLocaleDateString('ar-SA')}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                              {entry.description}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                              {Math.max(entry.total_debit || 0, entry.total_credit || 0).toLocaleString('ar-SA')}
                                            </TableCell>
                                            <TableCell>
                                              <Button
                                                size="sm"
                                                onClick={() => handleManualMatch(entry.id)}
                                              >
                                                <Check className="h-3 w-3" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleIgnore(tx.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
