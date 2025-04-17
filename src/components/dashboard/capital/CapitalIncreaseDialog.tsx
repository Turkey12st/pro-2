
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CapitalManagement } from "@/types/database";

interface CapitalUpdateData {
  amount: number;
  notes: string;
  transaction_type: string;
}

interface CapitalUpdateResult {
  success: boolean;
}

export function CapitalIncreaseDialog({ capitalData }: { capitalData: CapitalManagement }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [transactionType, setTransactionType] = useState<"increase" | "decrease">("increase");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCapital = useMutation<CapitalUpdateResult, Error, CapitalUpdateData>({
    mutationFn: async (data: CapitalUpdateData) => {
      // 1. إضافة سجل في جدول capital_history
      const { error: historyError } = await supabase
        .from("capital_history")
        .insert({
          previous_capital: capitalData.total_capital,
          amount: data.amount,
          new_capital: 
            data.transaction_type === "increase" 
              ? capitalData.total_capital + data.amount 
              : capitalData.total_capital - data.amount,
          transaction_type: data.transaction_type,
          notes: data.notes,
          effective_date: new Date().toISOString().split("T")[0],
        })
        .select();

      if (historyError) throw historyError;

      // 2. تحديث السجل في جدول capital_management
      const newTotalCapital = 
        data.transaction_type === "increase" 
          ? capitalData.total_capital + data.amount 
          : capitalData.total_capital - data.amount;
          
      const newAvailableCapital = 
        data.transaction_type === "increase" 
          ? capitalData.available_capital + data.amount 
          : capitalData.available_capital - data.amount;

      const { error: updateError } = await supabase
        .from("capital_management")
        .update({
          total_capital: newTotalCapital,
          available_capital: newAvailableCapital,
          last_updated: new Date().toISOString(),
        })
        .eq("id", capitalData.id);

      if (updateError) throw updateError;

      // Return a simple object with success status
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital_management"] });
      toast({
        title: transactionType === "increase" ? "تم زيادة رأس المال" : "تم تخفيض رأس المال",
        description: `تم تحديث قيمة رأس المال بنجاح`,
      });
      setOpen(false);
      setAmount("");
      setNotes("");
    },
    onError: (error) => {
      console.error("Error updating capital:", error);
      toast({
        title: "خطأ في تحديث رأس المال",
        description: "حدث خطأ أثناء محاولة تحديث رأس المال",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال قيمة صحيحة أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    updateCapital.mutate({
      amount: Number(amount),
      notes,
      transaction_type: transactionType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          <span>تحديث رأس المال</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تحديث رأس المال</DialogTitle>
          <DialogDescription>
            أدخل المبلغ المراد {transactionType === "increase" ? "إضافته إلى" : "خصمه من"} رأس المال.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={transactionType === "increase" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("increase")}
            >
              زيادة
            </Button>
            <Button
              type="button"
              variant={transactionType === "decrease" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("decrease")}
            >
              تخفيض
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              type="number"
              placeholder="أدخل المبلغ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              placeholder="أدخل ملاحظات حول سبب التحديث"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={updateCapital.isPending}
          >
            {updateCapital.isPending
              ? "جاري التحديث..."
              : transactionType === "increase"
              ? "زيادة رأس المال"
              : "تخفيض رأس المال"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
