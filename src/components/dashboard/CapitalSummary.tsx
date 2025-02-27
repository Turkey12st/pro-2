
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Plus, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";
import { CapitalManagement } from "@/types/database";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CapitalSummaryProps {
  data: CapitalManagement;
  isLoading?: boolean;
}

export function CapitalSummary({ data, isLoading = false }: CapitalSummaryProps) {
  const [isIncreaseDialogOpen, setIsIncreaseDialogOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState("");
  const [increaseReason, setIncreaseReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            رأس المال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex items-center justify-center">
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { total_capital, available_capital, reserved_capital } = data;
  const capitalUsagePercentage = ((total_capital - available_capital) / total_capital) * 100;

  const handleCapitalIncrease = async () => {
    if (!increaseAmount || Number(increaseAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح أكبر من صفر",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const increasedAmount = Number(increaseAmount);
      const newTotalCapital = total_capital + increasedAmount;
      const newAvailableCapital = available_capital + increasedAmount;

      // تحديث رأس المال
      const { error } = await supabase
        .from("capital_management")
        .update({
          total_capital: newTotalCapital,
          available_capital: newAvailableCapital,
          notes: `${data.notes || ''}\n${new Date().toISOString().split('T')[0]}: زيادة رأس المال بمبلغ ${increasedAmount} ريال. السبب: ${increaseReason}`,
          last_updated: new Date().toISOString()
        })
        .eq("id", data.id);

      if (error) throw error;

      // تسجيل الزيادة في سجل رأس المال
      await supabase.from("capital_history").insert({
        amount: increasedAmount,
        operation_type: "increase",
        notes: increaseReason,
        previous_total: total_capital,
        new_total: newTotalCapital,
        created_at: new Date().toISOString()
      });

      toast({
        title: "تمت زيادة رأس المال بنجاح",
        description: `تمت إضافة ${formatNumber(increasedAmount)} ريال إلى رأس المال`,
      });

      // إعادة تحميل بيانات رأس المال
      queryClient.invalidateQueries({ queryKey: ["capital_management"] });

      setIsIncreaseDialogOpen(false);
      setIncreaseAmount("");
      setIncreaseReason("");
    } catch (error) {
      console.error("Error increasing capital:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة زيادة رأس المال",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          رأس المال
        </CardTitle>
        <CardDescription>
          الإحصائيات المالية للسنة المالية {data.fiscal_year}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">رأس المال الكلي</span>
            <span className="text-sm font-bold">{formatNumber(total_capital)} ريال</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">رأس المال المتاح</span>
            <span className="text-sm font-bold">{formatNumber(available_capital)} ريال</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">رأس المال المحجوز</span>
            <span className="text-sm font-bold">{formatNumber(reserved_capital)} ريال</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>نسبة استخدام رأس المال</span>
            <span>{Math.round(capitalUsagePercentage)}%</span>
          </div>
          <Progress value={capitalUsagePercentage} className="h-2" />
        </div>

        <Dialog open={isIncreaseDialogOpen} onOpenChange={setIsIncreaseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              زيادة رأس المال
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>زيادة رأس المال</DialogTitle>
              <DialogDescription>
                أدخل المبلغ المراد إضافته إلى رأس المال وسبب الزيادة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ (ريال)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={increaseAmount}
                  onChange={(e) => setIncreaseAmount(e.target.value)}
                  placeholder="أدخل المبلغ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">سبب الزيادة</Label>
                <Textarea
                  id="reason"
                  value={increaseReason}
                  onChange={(e) => setIncreaseReason(e.target.value)}
                  placeholder="أدخل سبب زيادة رأس المال"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCapitalIncrease}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? "جاري التنفيذ..." : "تأكيد الزيادة"}
                <ArrowUpCircle className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
