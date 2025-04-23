
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileSpreadsheet } from "lucide-react";
import { ChartOfAccountsTree } from "./ChartOfAccountsTree";
import { ChartOfAccountForm } from "./ChartOfAccountForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChartOfAccount } from "@/types/database";
import { useChartOfAccounts } from "@/hooks/useChartOfAccounts";

export function ChartOfAccountsManager() {
  const { toast } = useToast();
  const { accounts, isLoading, error, fetchAccounts, addAccount, updateAccount, deleteAccount } = useChartOfAccounts();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [parentAccountId, setParentAccountId] = useState<string | undefined>(undefined);
  
  // تصفية الحسابات بناءً على البحث
  const filteredAccounts = accounts.filter(account => 
    account.account_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
    account.account_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddAccount = (parentId?: string) => {
    setParentAccountId(parentId);
    setEditingAccount(null);
    setIsDialogOpen(true);
  };
  
  const handleEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setParentAccountId(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      toast({
        title: "تم حذف الحساب",
        description: "تم حذف الحساب بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف الحساب. قد يكون الحساب مستخدم في قيود محاسبية أو لديه حسابات فرعية.",
      });
    }
  };
  
  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchAccounts();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>شجرة الحسابات</CardTitle>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" onClick={() => handleAddAccount()}>
            <Plus className="ml-2 h-4 w-4" /> إضافة حساب
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="ml-2 h-4 w-4" /> تصدير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث في شجرة الحسابات..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
          </div>
        ) : (
          <ChartOfAccountsTree
            accounts={filteredAccounts}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </CardContent>
      
      {/* نافذة إضافة/تعديل حساب */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "تعديل حساب" : "إضافة حساب جديد"}
            </DialogTitle>
          </DialogHeader>
          <ChartOfAccountForm
            account={editingAccount}
            parentAccountId={parentAccountId}
            accounts={accounts}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
