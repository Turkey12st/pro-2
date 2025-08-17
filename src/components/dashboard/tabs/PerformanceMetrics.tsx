import React, { useState, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CapitalManagement } from "@/types/database";

/**
 * Interface defining the props for the CapitalIncreaseDialog component.
 * @property {boolean} [isOpen] - Controls the dialog's open/close state.
 * @property {() => void} [onClose] - Function to call when the dialog is closed.
 * @property {() => void} [onSuccess] - Function to call upon a successful capital increase.
 * @property {number} [currentCapital] - The current capital amount to be increased.
 * @property {CapitalManagement} [capitalData] - Alternative prop for getting current capital.
 */
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
 * @param {CapitalIncreaseDialogProps} props - The component's properties.
 * @returns {React.ReactElement} The rendered dialog component.
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

  /**
   * Helper function to insert the capital increase transaction into the database.
   * This logic is separated to follow the Single Responsibility Principle.
   * @param {number} numericAmount - The amount of capital to increase.
   * @param {number} previousCapital - The capital before the increase.
   * @param {number} newCapital - The capital after the increase.
   */
  const insertCapitalIncrease = async (
    numericAmount: number,
    previousCapital: number,
    newCapital: number
  ) => {
    const { error } = await supabase
      .from("capital_history")
      .insert({
        amount: numericAmount,
        previous_capital: previousCapital,
        new_capital: newCapital,
        transaction_type: "increase",
        status: "completed",
      });

    if (error) {
      throw error;
    }
  };

  /**
   * Handles the form submission for capital increase.
   * This function is memoized using `useCallback` for performance.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      await insertCapitalIncrease(numericAmount, actualCapital, newCapital);

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
  }, [amount, actualCapital, onClose, onSuccess, toast]);

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

// Minimal performance metrics component expected by DashboardTabs
export function PerformanceMetrics({ financialData }: { financialData: { total_income: number; total_expenses: number; net_profit: number; profit_margin: number; } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مؤشرات الأداء</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">إجمالي الدخل</p>
          <p className="text-xl font-semibold">{financialData.total_income.toLocaleString('ar-SA')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
          <p className="text-xl font-semibold">{financialData.total_expenses.toLocaleString('ar-SA')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">صافي الربح</p>
          <p className="text-xl font-semibold">{financialData.net_profit.toLocaleString('ar-SA')}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">هامش الربح</p>
          <p className="text-xl font-semibold">{financialData.profit_margin}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
