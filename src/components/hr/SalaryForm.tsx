
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/hr";

type SalaryFormProps = {
  employee: Employee;
  onSuccess?: () => void;
};

export default function SalaryForm({ employee, onSuccess }: SalaryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [salaryData, setSalaryData] = useState({
    baseSalary: employee.baseSalary || 0,
    housingAllowance: employee.housingAllowance || 0,
    transportationAllowance: employee.transportationAllowance || 0,
    otherAllowances: employee.otherAllowances || [],
    gosiSubscription: employee.gosiSubscription || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("employees")
        .update({
          base_salary: salaryData.baseSalary,
          housing_allowance: salaryData.housingAllowance,
          transportation_allowance: salaryData.transportationAllowance,
          other_allowances: salaryData.otherAllowances,
          gosi_subscription: salaryData.gosiSubscription,
          salary: calculateTotalSalary()
        })
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "تم تحديث الراتب بنجاح",
        description: "تم حفظ تفاصيل الراتب الجديدة",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error updating salary:", error);
      toast({
        title: "خطأ في تحديث الراتب",
        description: "حدث خطأ أثناء محاولة تحديث الراتب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalSalary = () => {
    const totalOtherAllowances = salaryData.otherAllowances.reduce(
      (sum, allowance) => sum + allowance.amount,
      0
    );

    return (
      salaryData.baseSalary +
      salaryData.housingAllowance +
      salaryData.transportationAllowance +
      totalOtherAllowances
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الراتب الأساسي</Label>
              <Input
                type="number"
                value={salaryData.baseSalary}
                onChange={(e) =>
                  setSalaryData((prev) => ({
                    ...prev,
                    baseSalary: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>بدل السكن</Label>
              <Input
                type="number"
                value={salaryData.housingAllowance}
                onChange={(e) =>
                  setSalaryData((prev) => ({
                    ...prev,
                    housingAllowance: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>بدل المواصلات</Label>
              <Input
                type="number"
                value={salaryData.transportationAllowance}
                onChange={(e) =>
                  setSalaryData((prev) => ({
                    ...prev,
                    transportationAllowance: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>اشتراك التأمينات الاجتماعية</Label>
              <Input
                type="number"
                value={salaryData.gosiSubscription}
                onChange={(e) =>
                  setSalaryData((prev) => ({
                    ...prev,
                    gosiSubscription: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <Label>إجمالي الراتب</Label>
              <span className="text-xl font-bold">
                {calculateTotalSalary().toLocaleString()} ريال
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ تفاصيل الراتب"}
      </Button>
    </form>
  );
}
