
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChartOfAccount } from "@/types/database";

export function useChartOfAccounts() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("account_number", { ascending: true });

      if (error) throw error;
      
      // Cast the returned data to ChartOfAccount type
      const typedAccounts: ChartOfAccount[] = data?.map(account => ({
        ...account,
        account_type: account.account_type as ChartOfAccount['account_type'],
        balance_type: account.balance_type as 'debit' | 'credit'
      })) || [];
      
      // Organize the data in a tree structure
      const organizedAccounts = organizeAccountsHierarchy(typedAccounts);
      setAccounts(organizedAccounts);
    } catch (err) {
      console.error("خطأ في جلب الحسابات:", err);
      setError(err instanceof Error ? err : new Error("حدث خطأ غير معروف"));
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب بيانات الحسابات",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addAccount = async (accountData: Partial<ChartOfAccount>): Promise<ChartOfAccount | null> => {
    try {
      if (!accountData.account_name || !accountData.account_number || !accountData.account_type) {
        throw new Error("بيانات الحساب غير مكتملة");
      }

      const { data, error } = await supabase
        .from("chart_of_accounts")
        .insert({
          account_name: accountData.account_name,
          account_number: accountData.account_number,
          account_type: accountData.account_type,
          balance_type: accountData.balance_type || 'debit',
          description: accountData.description,
          parent_account_id: accountData.parent_account_id,
          level: accountData.level || 1,
          is_active: accountData.is_active !== undefined ? accountData.is_active : true
        })
        .select("*")
        .single();

      if (error) throw error;
      
      if (data) {
        const typedAccount: ChartOfAccount = {
          ...data,
          account_type: data.account_type as ChartOfAccount['account_type'],
          balance_type: data.balance_type as 'debit' | 'credit'
        };
        
        setAccounts(prev => organizeAccountsHierarchy([...prev, typedAccount]));
        return typedAccount;
      }
      return null;
    } catch (err) {
      console.error("خطأ في إضافة حساب:", err);
      toast({
        variant: "destructive",
        title: "فشل في الإضافة",
        description: "حدث خطأ أثناء محاولة إضافة الحساب",
      });
      throw err;
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<ChartOfAccount>): Promise<ChartOfAccount | null> => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .update(updates)
        .eq("id", accountId)
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        const typedAccount: ChartOfAccount = {
          ...data,
          account_type: data.account_type as ChartOfAccount['account_type'],
          balance_type: data.balance_type as 'debit' | 'credit'
        };
        
        setAccounts(prev => {
          const updatedAccounts = prev.map(account => 
            account.id === accountId ? { ...account, ...typedAccount } : account
          );
          return organizeAccountsHierarchy(updatedAccounts);
        });
        return typedAccount;
      }
      return null;
    } catch (err) {
      console.error("خطأ في تحديث حساب:", err);
      toast({
        variant: "destructive",
        title: "فشل في التحديث",
        description: "حدث خطأ أثناء محاولة تحديث الحساب",
      });
      throw err;
    }
  };

  const deleteAccount = async (accountId: string): Promise<boolean> => {
    try {
      // أولاً، تحقق مما إذا كان الحساب لديه حسابات فرعية
      const hasChildren = accounts.some(account => account.parent_account_id === accountId);
      
      if (hasChildren) {
        throw new Error("لا يمكن حذف الحساب لأنه يحتوي على حسابات فرعية");
      }

      // ثانيًا، تحقق مما إذا كان الحساب مستخدمًا في سجلات محاسبية
      const { count, error: countError } = await supabase
        .from("journal_entry_items")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        throw new Error("لا يمكن حذف الحساب لأنه مستخدم في سجلات محاسبية");
      }

      // حذف الحساب إذا لم يكن لديه حسابات فرعية ولم يكن مستخدمًا
      const { error } = await supabase
        .from("chart_of_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;
      
      setAccounts(prev => {
        const filteredAccounts = prev.filter(account => account.id !== accountId);
        return organizeAccountsHierarchy(filteredAccounts);
      });

      return true;
    } catch (err) {
      console.error("خطأ في حذف حساب:", err);
      toast({
        variant: "destructive",
        title: "فشل في الحذف",
        description: err instanceof Error ? err.message : "حدث خطأ أثناء محاولة حذف الحساب",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };
}

// دالة مساعدة لتنظيم الحسابات في تسلسل هرمي
function organizeAccountsHierarchy(accounts: ChartOfAccount[]): ChartOfAccount[] {
  // نسخة من الحسابات مع إضافة مصفوفة فارغة للأطفال
  const accountsWithChildren = accounts.map(account => ({
    ...account,
    children: []
  })) as ChartOfAccount[];

  // إنشاء مؤشر للوصول السريع للحسابات حسب المعرف
  const accountMap = new Map<string, ChartOfAccount>();
  accountsWithChildren.forEach(account => {
    accountMap.set(account.id, account);
  });

  // بناء الهيكل الشجري
  accountsWithChildren.forEach(account => {
    if (account.parent_account_id) {
      const parent = accountMap.get(account.parent_account_id);
      if (parent && parent.children) {
        parent.children.push(account);
      }
    }
  });

  return accountsWithChildren;
}
