
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { CapitalManagement } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";

interface CapitalIncreaseDialogProps {
  capitalData: CapitalManagement;
}

export function CapitalIncreaseDialog({ capitalData }: CapitalIncreaseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isIncreaseDialogOpen, setIsIncreaseDialogOpen] = useState(false);
  const [increasedAmount, setIncreasedAmount] = useState<number | "">("");
  const [increaseReason, setIncreaseReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncrease = async () => {
    if (typeof increasedAmount !== "number" || increasedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ في الإدخال",
        description: "يرجى إدخال مبلغ صحيح أكبر من الصفر",
      });
      return;
    }

    if (!increaseReason.trim()) {
      toast({
        variant: "destructive",
        title: "سبب الزيادة مطلوب",
        description: "يرجى إدخال سبب زيادة رأس المال",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const newTotalCapital = (capitalData.total_capital || 0) + increasedAmount;
      const newAvailableCapital = (capitalData.available_capital || 0) + increasedAmount;
      const notes = capitalData.notes || "";
      const currentDate = new Date().toISOString().split('T')[0];
      const updateNotes = `${notes || ''}\n${currentDate}: زيادة رأس المال بمبلغ ${increasedAmount} ريال. السبب: ${increaseReason}`;

      const updateData = {
        total_capital: newTotalCapital,
        available_capital: newAvailableCapital,
        notes: updateNotes,
        last_updated: new Date().toISOString()
      };

      if (capitalData.id) {
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
            reserved_capital: 0,
            notes: updateNotes,
          });

        if (error) throw error;
      }

      const { error: historyError } = await supabase
        .from("capital_history")
        .insert({
          transaction_type: "increase",
          amount: increasedAmount,
          previous_capital: capitalData.total_capital,
          new_capital: newTotalCapital,
          effective_date: new Date().toISOString().split('T')[0],
          notes: increaseReason,
        });

      if (historyError) {
        console.error("Error recording capital history:", historyError);
      }

      setIncreasedAmount("");
      setIncreaseReason("");
      setIsSubmitting(false);

      toast({
        title: "تمت زيادة رأس المال بنجاح",
        description: `تمت إضافة ${formatNumber(increasedAmount)} ريال إلى رأس المال`,
      });

      queryClient.invalidateQueries({ queryKey: ["capital_management"] });

      setIsIncreaseDialogOpen(false);
    } catch (error) {
      console.error("Error increasing capital:", error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء زيادة رأس المال، يرجى المحاولة مرة أخرى",
      });
    }
  };

  return (
    <Dialog open={isIncreaseDialogOpen} onOpenChange={setIsIncreaseDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" />
          زيادة رأس المال
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>زيادة رأس المال</DialogTitle>
          <DialogDescription>
            أدخل مبلغ الزيادة وسبب الزيادة في رأس المال
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right col-span-1">
              المبلغ
            </Label>
            <Input
              id="amount"
              type="number"
              value={increasedAmount}
              onChange={(e) => setIncreasedAmount(e.target.value ? Number(e.target.value) : "")}
              className="col-span-3"
              placeholder="أدخل مبلغ الزيادة"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right col-span-1">
              السبب
            </Label>
            <Textarea
              id="reason"
              value={increaseReason}
              onChange={(e) => setIncreaseReason(e.target.value)}
              className="col-span-3"
              placeholder="أدخل سبب زيادة رأس المال"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleIncrease} disabled={isSubmitting}>
            {isSubmitting ? "جار التنفيذ..." : "تأكيد الزيادة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
