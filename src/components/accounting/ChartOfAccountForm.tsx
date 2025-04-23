
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChartOfAccount } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

interface ChartOfAccountFormProps {
  account?: ChartOfAccount | null;
  parentAccountId?: string;
  accounts: ChartOfAccount[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChartOfAccountForm({
  account,
  parentAccountId,
  accounts,
  onSuccess,
  onCancel
}: ChartOfAccountFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    account_number: "",
    account_name: "",
    account_type: "asset",
    level: 1,
    is_active: true,
    balance_type: "debit",
    description: ""
  });

  // تحميل بيانات الحساب للتعديل أو تعيين الحساب الأب للإضافة
  useEffect(() => {
    if (account) {
      setFormData({
        ...account
      });
    } else if (parentAccountId) {
      const parentAccount = accounts.find(a => a.id === parentAccountId);
      if (parentAccount) {
        // إذا كان هناك حساب أب، نقوم بتعيين القيم الافتراضية المناسبة
        setFormData(prev => ({
          ...prev,
          parent_account_id: parentAccountId,
          account_type: parentAccount.account_type,
          level: parentAccount.level + 1,
          balance_type: parentAccount.balance_type,
          // توليد رقم حساب تلقائي بناءً على الحساب الأب
          account_number: `${parentAccount.account_number}0`
        }));
      }
    }
  }, [account, parentAccountId, accounts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.account_number) {
      errors.push("رقم الحساب مطلوب");
    }
    if (!formData.account_name) {
      errors.push("اسم الحساب مطلوب");
    }
    if (!formData.account_type) {
      errors.push("نوع الحساب مطلوب");
    }
    
    // التحقق من عدم تكرار رقم الحساب
    const duplicateAccount = accounts.find(
      a => a.account_number === formData.account_number && a.id !== account?.id
    );
    
    if (duplicateAccount) {
      errors.push("رقم الحساب مستخدم بالفعل. يرجى اختيار رقم آخر");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: errors.join(", ")
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (account?.id) {
        // تحديث حساب موجود
        const { error } = await supabase
          .from("chart_of_accounts")
          .update({
            account_number: formData.account_number,
            account_name: formData.account_name,
            account_type: formData.account_type,
            parent_account_id: formData.parent_account_id,
            level: formData.level,
            is_active: formData.is_active,
            balance_type: formData.balance_type,
            description: formData.description,
            updated_at: new Date().toISOString()
          })
          .eq("id", account.id);
          
        if (error) throw error;
        
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث الحساب بنجاح"
        });
      } else {
        // إضافة حساب جديد
        const { error } = await supabase
          .from("chart_of_accounts")
          .insert({
            account_number: formData.account_number,
            account_name: formData.account_name,
            account_type: formData.account_type,
            parent_account_id: formData.parent_account_id,
            level: formData.level,
            is_active: formData.is_active,
            balance_type: formData.balance_type,
            description: formData.description
          });
          
        if (error) throw error;
        
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تمت إضافة الحساب بنجاح"
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("خطأ في حفظ الحساب", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الحساب. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // الحصول على قائمة الحسابات الأب المحتملة
  const possibleParentAccounts = accounts.filter(a => 
    // الحساب لا يمكن أن يكون أب لنفسه
    (!account || a.id !== account.id) &&
    // الحساب لا يمكن أن يكون أب لأحد أسلافه
    (!account || !isDescendantOf(a, account.id, accounts)) && 
    // يجب أن يكون من نفس النوع (أصول، خصوم، إلخ)
    a.account_type === formData.account_type
  );
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account_number">رقم الحساب</Label>
          <Input
            id="account_number"
            name="account_number"
            value={formData.account_number || ""}
            onChange={handleChange}
            placeholder="مثال: 1010"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_name">اسم الحساب</Label>
          <Input
            id="account_name"
            name="account_name"
            value={formData.account_name || ""}
            onChange={handleChange}
            placeholder="اسم الحساب"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account_type">نوع الحساب</Label>
          <Select
            value={formData.account_type}
            onValueChange={(value) => handleSelectChange("account_type", value)}
            disabled={!!parentAccountId} // تعطيل التغيير إذا كان حساب فرعي
          >
            <SelectTrigger id="account_type">
              <SelectValue placeholder="اختر نوع الحساب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">الأصول</SelectItem>
              <SelectItem value="liability">الخصوم</SelectItem>
              <SelectItem value="equity">حقوق الملكية</SelectItem>
              <SelectItem value="revenue">الإيرادات</SelectItem>
              <SelectItem value="expense">المصروفات</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="balance_type">نوع الرصيد</Label>
          <Select
            value={formData.balance_type}
            onValueChange={(value) => handleSelectChange("balance_type", value)}
            disabled={!!parentAccountId} // تعطيل التغيير إذا كان حساب فرعي
          >
            <SelectTrigger id="balance_type">
              <SelectValue placeholder="اختر نوع الرصيد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">مدين</SelectItem>
              <SelectItem value="credit">دائن</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="parent_account_id">الحساب الأب</Label>
        <Select
          value={formData.parent_account_id || ""}
          onValueChange={(value) => handleSelectChange("parent_account_id", value)}
          disabled={!!parentAccountId} // تعطيل التغيير إذا تم تحديده مسبقًا
        >
          <SelectTrigger id="parent_account_id">
            <SelectValue placeholder="بدون حساب أب (حساب رئيسي)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">بدون حساب أب (حساب رئيسي)</SelectItem>
            {possibleParentAccounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.account_number} - {a.account_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="وصف الحساب (اختياري)"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : account ? "تحديث الحساب" : "إضافة الحساب"}
        </Button>
      </div>
    </form>
  );
}

// دالة مساعدة للتحقق مما إذا كان حساب معين هو سلف لحساب آخر
function isDescendantOf(account: ChartOfAccount, ancestorId: string, allAccounts: ChartOfAccount[]): boolean {
  let currentId: string | null | undefined = account.id;
  const visited = new Set<string>();
  
  while (currentId) {
    if (visited.has(currentId)) {
      // تجنب الدورات اللانهائية
      return false;
    }
    
    if (currentId === ancestorId) {
      return true;
    }
    
    visited.add(currentId);
    
    const current = allAccounts.find(a => a.id === currentId);
    currentId = current?.parent_account_id;
  }
  
  return false;
}
