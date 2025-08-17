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
import { CapitalManagement } from "@/types/database";

interface CapitalIncreaseDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  currentCapital?: number;
  capitalData?: CapitalManagement;
}

/**
 * A dialog component for increasing the company's capital.
 * It handles the input, form submission, and interaction with the database.
 */
export function CapitalIncreaseDialog({
  isOpen = false,
  onClose = () => {},
  onSuccess,
  currentCapital,
  capitalData,
}: CapitalIncreaseDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Determine the actual capital to use based on the provided props
  const actualCapital = currentCapital !== undefined
    ? currentCapital
    : (capitalData?.total_capital || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    
    // Client-side validation to ensure a valid positive number is entered
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "الرجاء إدخال مبلغ صحيح وموجب.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newCapital = actualCapital + numericAmount;

      const { error } = await supabase
        .from("capital_history")
        .insert({
          amount: numericAmount,
          previous_capital: actualCapital,
          new_capital: newCapital,
          transaction_type: "increase",
          status: "completed",
        });

      if (error) throw error;

      toast({
        title: "تم زيادة رأس المال بنجاح",
        description: `تمت إضافة ${amount} ريال إلى رأس المال`,
      });

      // Call onSuccess callback if provided and close the dialog
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
