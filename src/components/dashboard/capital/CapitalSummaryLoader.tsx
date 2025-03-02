
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export function CapitalSummaryLoader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          رأس المال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[100px] flex items-center justify-center">
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </CardContent>
    </Card>
  );
}
