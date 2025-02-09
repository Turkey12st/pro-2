
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ZakatPage() {
  const { toast } = useToast();

  const handleCalculateZakat = () => {
    toast({
      title: "حساب الزكاة",
      description: "جاري حساب الزكاة والضرائب",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              حساب الزكاة والضرائب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رأس المال</Label>
                  <Input type="number" placeholder="أدخل رأس المال" />
                </div>
                <div className="space-y-2">
                  <Label>الأرباح السنوية</Label>
                  <Input type="number" placeholder="أدخل الأرباح السنوية" />
                </div>
              </div>
              <Button 
                className="w-full flex items-center gap-2"
                onClick={handleCalculateZakat}
              >
                <Calculator className="h-4 w-4" />
                حساب الزكاة والضرائب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
