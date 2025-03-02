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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CapitalManagement } from "@/types/database";
import { formatNumber } from "@/lib/utils";
import { Plus, ArrowUpCircle } from "lucide-react";

interface CapitalIncreaseDialogProps {
  capitalData: CapitalManagement;
}

type CapitalUpdate = {
  total_capital: number;
  available_capital: number;
  notes: string;
  last_updated: string;
};

export function CapitalIncreaseDialog({ capitalData }: CapitalIncreaseDialogProps) {
  const [isIncreaseDialogOpen, setIsIncreaseDialogOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState("");
  const [increaseReason, setIncreaseReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const { total_capital, available_capital, reserved_capital, notes } = capitalData;
      const increasedAmount = Number(increaseAmount);
      const newTotalCapital = total_capital + increasedAmount;
      const newAvailableCapital = available_capital + increasedAmount;
      const currentDate = new Date().toISOString().split('T')[0];
      const updateNotes = `${notes || ''}\n${currentDate}: زيادة رأس المال بمبلغ ${increasedAmount} ريال. السبب: ${increaseReason}`;

      if (capitalData.id) {
        const updateData: CapitalUpdate = {
          total_capital: newTotalCapital,
          available_capital: newAvailableCapital,
          notes: updateNotes,
          last_updated: new Date().toISOString()
        };

        const { error } = await supabase
          .from("capital_management")
          .update(updateData)
          .eq("id", capitalData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("capital_management")
          .insert({
            fiscal_year: new Date().getFullYear(),
            total_capital: newTotalCapital,
            available_capital: newAvailableCapital,
            reserved_capital: reserved_capital || 0,
            notes: updateNotes
          });

        if (error) throw error;
      }

      const { error: historyError } = await supabase
        .from("capital_history")
        .insert({
          amount: increasedAmount,
          transaction_type: "increase",
          notes: increaseReason,
          previous_capital: total_capital,
          new_capital: newTotalCapital,
          effective_date: currentDate,
          status: 'approved',
          created_at: new Date().toISOString()
        });

      if (historyError) {
        console.warn("تم تحديث رأس المال لكن فشل تسجيل التاريخ:", historyError);
      }

      toast({
        title: "تمت زيادة رأس المال بنجاح",
        description: `تمت إضافة ${formatNumber(increasedAmount)} ريال إلى رأس المال`,
      });

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
  );
}
