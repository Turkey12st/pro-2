import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBankAccounts } from "../hooks/useBankAccounts";

interface BankAccountForm {
  bank_name: string;
  account_number: string;
  iban: string;
  account_type: string;
  currency: string;
  opening_balance: number;
}

const initialForm: BankAccountForm = {
  bank_name: '',
  account_number: '',
  iban: '',
  account_type: 'جاري',
  currency: 'SAR',
  opening_balance: 0
};

export default function BankAccountsManager() {
  const { toast } = useToast();
  const { bankAccounts, isLoading, addAccount, updateAccount, deleteAccount } = useBankAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BankAccountForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.bank_name || !form.account_number) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم البنك ورقم الحساب"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateAccount(editingId, form);
        toast({ title: "تم التحديث", description: "تم تحديث الحساب البنكي" });
      } else {
        await addAccount(form);
        toast({ title: "تمت الإضافة", description: "تم إضافة الحساب البنكي" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: typeof bankAccounts[0]) => {
    setEditingId(account.id);
    setForm({
      bank_name: account.bank_name,
      account_number: account.account_number,
      iban: account.iban || '',
      account_type: account.account_type || 'جاري',
      currency: account.currency || 'SAR',
      opening_balance: account.opening_balance || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;

    try {
      await deleteAccount(id);
      toast({ title: "تم الحذف", description: "تم حذف الحساب البنكي" });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            الحسابات البنكية
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>اسم البنك *</Label>
                    <Input
                      value={form.bank_name}
                      onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                      placeholder="مثال: البنك الأهلي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الحساب *</Label>
                    <Input
                      value={form.account_number}
                      onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                      placeholder="رقم الحساب البنكي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الآيبان</Label>
                    <Input
                      value={form.iban}
                      onChange={(e) => setForm({ ...form, iban: e.target.value })}
                      placeholder="SA..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الحساب</Label>
                    <Input
                      value={form.account_type}
                      onChange={(e) => setForm({ ...form, account_type: e.target.value })}
                      placeholder="جاري / توفير"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العملة</Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      placeholder="SAR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الرصيد الافتتاحي</Label>
                    <Input
                      type="number"
                      value={form.opening_balance}
                      onChange={(e) => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                    {editingId ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم البنك</TableHead>
                  <TableHead>رقم الحساب</TableHead>
                  <TableHead>الآيبان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد الحالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : bankAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد حسابات بنكية
                    </TableCell>
                  </TableRow>
                ) : (
                  bankAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.bank_name}</TableCell>
                      <TableCell className="font-mono">{account.account_number}</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {account.iban || '-'}
                      </TableCell>
                      <TableCell>{account.account_type || '-'}</TableCell>
                      <TableCell className="font-mono">
                        {(account.current_balance || 0).toLocaleString('ar-SA')} {account.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(account)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(account.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
