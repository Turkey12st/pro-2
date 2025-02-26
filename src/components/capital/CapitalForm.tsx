import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function CapitalForm() {
  const [capitalAmount, setCapitalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: currentCapital } = useQuery({
    queryKey: ['current_capital'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('capital')
        .insert([{ amount: capitalAmount }]);

      if (error) throw error;

      toast({
        title: "تم تحديث رأس المال بنجاح",
        description: "تم حفظ المبلغ في قاعدة البيانات",
      });
    } catch (error) {
      console.error('Error saving capital:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ المبلغ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة رأس المال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capital">
            المبلغ الحالي: {currentCapital ? currentCapital.total_capital : 'جاري التحميل...'}
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capital">أدخل المبلغ الجديد</Label>
          <Input
            type="number"
            id="capital"
            placeholder="أدخل المبلغ هنا"
            value={capitalAmount}
            onChange={(e) => setCapitalAmount(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ المبلغ"}
        </Button>
      </CardContent>
    </Card>
  );
}
