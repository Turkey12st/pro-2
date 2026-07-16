
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";

export default function FinancialPage() {
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: "جاري إنشاء التقرير",
      description: "يتم الآن تجهيز التقرير المالي",
    });
  };

  return (
    <PageShell
      title="التقارير المالية"
      description="إنشاء وتصدير التقارير المالية الشاملة"
      icon={FileText}
      actions={
        <Button onClick={handleGenerateReport} className="gap-2">
          <Download className="h-4 w-4" />
          إنشاء تقرير مالي جديد
        </Button>
      }
    >
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          استخدم الزر أعلاه لإنشاء تقرير مالي جديد. سيتم عرض التقارير المُنشأة هنا.
        </CardContent>
      </Card>
    </>
  );
}
