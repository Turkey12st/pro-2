
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type CapitalFormData = {
  fiscal_year: number;
  total_capital: number;
  available_capital: number;
  reserved_capital: number;
  notes: string;
};

const initialFormData: CapitalFormData = {
  fiscal_year: new Date().getFullYear(),
  total_capital: 0,
  available_capital: 0,
  reserved_capital: 0,
  notes: "",
};

export default function CapitalForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<CapitalFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateFormData = () => {
    const errors = [];
    if (formData.total_capital <= 0) {
      errors.push("إجمالي رأس المال يجب أن يكون أكبر من صفر");
    }
    if (formData.available_capital < 0) {
      errors.push("رأس المال المتاح يجب أن يكون أكبر من أو يساوي صفر");
    }
    if (formData.reserved_capital < 0) {
      errors.push("رأس المال المحجوز يجب أن يكون أكبر من أو يساوي صفر");
    }
    if (formData.available_capital + formData.reserved_capital > formData.total_capital) {
      errors.push("مجموع رأس المال المتاح والمحجوز يجب أن لا يتجاوز إجمالي رأس المال");
    }
    return errors;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const errors = validateFormData();
      if (errors.length > 0) {
        setError(errors.join("\n"));
        return;
      }

      setIsSubmitting(true);
      console.log("بدء عملية حفظ رأس المال...", formData);

      // التحقق من الاتصال بقاعدة البيانات
      const { data: connectionTest, error: connectionError } = await supabase
        .from("capital_management")
        .select("count")
        .limit(1);

      if (connectionError) {
        throw new Error("لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
      }

      const { data, error } = await supabase
        .from("capital_management")
        .insert([formData])
        .select();

      if (error) throw error;

      console.log("تم حفظ بيانات رأس المال بنجاح:", data);

      toast({
        title: "تم الحفظ بنجاح",
        description: `تم إضافة رأس المال للسنة المالية ${formData.fiscal_year}`
      });
      
      setFormData(initialFormData);
      onSuccess();
    } catch (error: any) {
      console.error("خطأ في حفظ رأس المال:", error);
      setError(error.message || "حدث خطأ أثناء حفظ بيانات رأس المال");
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ بيانات رأس المال",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>السنة المالية</Label>
            <Input
              type="number"
              value={formData.fiscal_year}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fiscal_year: parseInt(e.target.value) || new Date().getFullYear(),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>إجمالي رأس المال</Label>
            <Input
              type="number"
              min="0"
              value={formData.total_capital}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  total_capital: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>رأس المال المتاح</Label>
            <Input
              type="number"
              min="0"
              value={formData.available_capital}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  available_capital: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>رأس المال المحجوز</Label>
            <Input
              type="number"
              min="0"
              value={formData.reserved_capital}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reserved_capital: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>ملاحظات</Label>
          <Input
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "إضافة رأس مال جديد"}
        </Button>
      </CardContent>
    </Card>
  );
}
