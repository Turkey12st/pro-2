
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CapitalIncreaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentCapital: number;
}

export function CapitalIncreaseDialog({
  isOpen,
  onClose,
  onSuccess,
  currentCapital,
}: CapitalIncreaseDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    try {
      const numericAmount = parseFloat(amount);
      const newCapital = currentCapital + numericAmount;

      const { error } = await supabase
        .from("capital_history")
        .insert({
          amount: numericAmount,
          previous_capital: currentCapital,
          new_capital: newCapital,
          transaction_type: "increase",
          status: "completed",
        });

      if (error) throw error;

      toast({
        title: "تم زيادة رأس المال بنجاح",
        description: `تمت إضافة ${amount} ريال إلى رأس المال`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error increasing capital:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء محاولة زيادة رأس المال",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>زيادة رأس المال</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">مقدار الزيادة (ريال)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري التنفيذ..." : "تأكيد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
