import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  iban: string | null;
  account_type: string | null;
  currency: string | null;
  opening_balance: number | null;
  current_balance: number | null;
  is_active: boolean | null;
  company_id: string;
  created_at: string | null;
}

export function useBankAccounts() {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('bank_name');

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الحسابات",
        description: error instanceof Error ? error.message : "حدث خطأ"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (accountData: Partial<BankAccount>) => {
    // جلب company_id من أول شركة متاحة
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single();

    if (!companies?.id) {
      throw new Error("لا توجد شركة مرتبطة");
    }

    const insertData = {
      bank_name: accountData.bank_name || '',
      account_number: accountData.account_number || '',
      iban: accountData.iban || null,
      account_type: accountData.account_type || null,
      currency: accountData.currency || 'SAR',
      opening_balance: accountData.opening_balance || 0,
      company_id: companies.id,
      is_active: true,
      current_balance: accountData.opening_balance || 0
    };

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    setBankAccounts(prev => [...prev, data]);
    return data;
  };

  const updateAccount = async (id: string, updates: Partial<BankAccount>) => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setBankAccounts(prev => prev.map(a => a.id === id ? data : a));
    return data;
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

  return {
    bankAccounts,
    isLoading,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount
  };
}
