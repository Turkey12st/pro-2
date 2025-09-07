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

interface EnhancedEmployeeBenefitsProps {
  employeeId?: string;
}

interface Benefit {
  id: string;
  benefit_type: string;
  benefit_name: string;
  amount: number;
  date: string;
  notes?: string;
  status: string;
}

export function EnhancedEmployeeBenefits({ employeeId }: EnhancedEmployeeBenefitsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([
    {
      id: "1",
      benefit_type: "bonus",
      benefit_name: "مكافأة الأداء المتميز",
      amount: 2000,
      date: "2024-01-15",
      notes: "مكافأة شهرية لتحقيق الأهداف",
      status: "active"
    },
    {
      id: "2", 
      benefit_type: "allowance",
      benefit_name: "بدل مواصلات إضافي",
      amount: 500,
      date: "2024-01-01",
      notes: "بدل إضافي للمواصلات",
      status: "active"
    }
  ]);

  const [newBenefit, setNewBenefit] = useState({
    benefit_type: '',
    benefit_name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active'
  });

  const { toast } = useToast();

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

  const handleAddBenefit = () => {
    if (!newBenefit.benefit_name || !newBenefit.amount) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const newId = Date.now().toString();
    const benefit: Benefit = {
      id: newId,
      ...newBenefit
    };

    setBenefits(prev => [...prev, benefit]);
    
    toast({
      title: "تم إضافة الميزة بنجاح",
      description: "تم حفظ الميزة الجديدة للموظف"
    });

    setIsAddDialogOpen(false);
    setNewBenefit({
      benefit_type: '',
      benefit_name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'active'
    });
  };

  const handleRemoveBenefit = (benefitId: string) => {
    setBenefits(prev => prev.filter(b => b.id !== benefitId));
    
    toast({
      title: "تم حذف الميزة",
      description: "تم حذف الميزة بنجاح"
    });
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
                <label className="block text-sm font-medium mb-2">اسم الميزة</label>
                <Input
                  value={newBenefit.benefit_name}
                  onChange={(e) => setNewBenefit({...newBenefit, benefit_name: e.target.value})}
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
              <div>
                <label className="block text-sm font-medium mb-2">الملاحظات</label>
                <Input
                  value={newBenefit.notes}
                  onChange={(e) => setNewBenefit({...newBenefit, notes: e.target.value})}
                  placeholder="ملاحظات إضافية"
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
        {benefits && benefits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>اسم الميزة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الملاحظات</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.map((benefit: Benefit) => (
                <TableRow key={benefit.id}>
                  <TableCell>{getBenefitTypeLabel(benefit.benefit_type)}</TableCell>
                  <TableCell>{benefit.benefit_name}</TableCell>
                  <TableCell>{formatSalary(benefit.amount)}</TableCell>
                  <TableCell>{format(new Date(benefit.date), "yyyy/MM/dd")}</TableCell>
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