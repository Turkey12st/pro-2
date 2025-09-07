import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatSalary } from "@/utils/formatters";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EnhancedEmployeeBenefitsProps {
  employeeId?: string;
}

interface Benefit {
  id: string;
  benefit_type: string;
  amount: number;
  date: string;
  notes?: string;
  status: string;
  created_at: string;
  employee_id?: string;
  created_by?: string;
}

export function EnhancedEmployeeBenefits({ employeeId }: EnhancedEmployeeBenefitsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBenefit, setNewBenefit] = useState({
    benefit_type: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: benefits, isLoading } = useQuery({
    queryKey: ["employee-benefits", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from("employee_deductions")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  const benefitTypes = [
    { value: 'bonus', label: 'مكافأة' },
    { value: 'allowance', label: 'بدل' },
    { value: 'commission', label: 'عمولة' },
    { value: 'overtime', label: 'عمل إضافي' },
    { value: 'incentive', label: 'حافز' },
    { value: 'medical', label: 'تأمين طبي' },
    { value: 'transportation', label: 'بدل مواصلات إضافي' },
    { value: 'housing', label: 'بدل سكن إضافي' },
    { value: 'other', label: 'أخرى' }
  ];

  const handleAddBenefit = async () => {
    if (!employeeId || !newBenefit.amount) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employee_deductions')
        .insert({
          employee_id: employeeId,
          benefit_type: newBenefit.benefit_type,
          amount: newBenefit.amount,
          date: newBenefit.date,
          notes: newBenefit.notes,
          status: newBenefit.status
        });

      if (error) throw error;

      toast({
        title: "تم إضافة الميزة بنجاح",
        description: "تم حفظ الميزة الجديدة للموظف"
      });

      setIsAddDialogOpen(false);
      setNewBenefit({
        benefit_type: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active'
      });

      queryClient.invalidateQueries({ queryKey: ["employee-benefits", employeeId] });
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة الميزة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveBenefit = async (benefitId: string) => {
    try {
      const { error } = await supabase
        .from('employee_deductions')
        .update({ status: 'inactive' })
        .eq('id', benefitId);

      if (error) throw error;

      toast({
        title: "تم حذف الميزة",
        description: "تم إلغاء تفعيل الميزة بنجاح"
      });

      queryClient.invalidateQueries({ queryKey: ["employee-benefits", employeeId] });
    } catch (error: any) {
      toast({
        title: "خطأ في حذف الميزة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getBenefitTypeLabel = (type: string) => {
    const benefitType = benefitTypes.find(bt => bt.value === type);
    return benefitType ? benefitType.label : type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>الاستحقاقات والمكافآت</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              إضافة ميزة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة ميزة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نوع الميزة</label>
                <Select value={newBenefit.benefit_type} onValueChange={(value) => setNewBenefit({...newBenefit, benefit_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الميزة" />
                  </SelectTrigger>
                  <SelectContent>
                    {benefitTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <Input
                  value={newBenefit.notes}
                  onChange={(e) => setNewBenefit({...newBenefit, notes: e.target.value})}
                  placeholder="مثال: مكافأة الأداء المتميز"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">المبلغ (ريال)</label>
                <Input
                  type="number"
                  value={newBenefit.amount}
                  onChange={(e) => setNewBenefit({...newBenefit, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">التاريخ</label>
                <Input
                  type="date"
                  value={newBenefit.date}
                  onChange={(e) => setNewBenefit({...newBenefit, date: e.target.value})}
                />
              </div>
              <Button onClick={handleAddBenefit} className="w-full">
                إضافة الميزة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!isLoading && benefits && benefits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الملاحظات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.map((benefit: Benefit) => (
                <TableRow key={benefit.id}>
                  <TableCell>{getBenefitTypeLabel(benefit.benefit_type)}</TableCell>
                  <TableCell>{formatSalary(benefit.amount)}</TableCell>
                  <TableCell>{format(new Date(benefit.date), "yyyy/MM/dd")}</TableCell>
                  <TableCell>{benefit.status}</TableCell>
                  <TableCell>{benefit.notes || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveBenefit(benefit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد مزايا مسجلة لهذا الموظف</p>
            <p className="text-sm text-muted-foreground mt-2">
              اضغط على "إضافة ميزة" لإضافة مزايا جديدة
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}