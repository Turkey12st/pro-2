import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinancialPage() {
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: "جاري إنشاء التقرير",
      description: "يتم الآن تجهيز التقرير المالي",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="h-5 w-5" />
              التقارير المالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full flex items-center gap-2"
                onClick={handleGenerateReport}
              >
                <Download className="h-4 w-4" />
                إنشاء تقرير مالي جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
