
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { CapitalManagement } from "@/types/database";
import { CapitalIncreaseDialog } from "./CapitalIncreaseDialog";
import { CapitalDetails } from "./CapitalDetails";
import { CapitalSummaryLoader } from "./CapitalSummaryLoader";

interface CapitalSummaryProps {
  data: CapitalManagement;
  isLoading?: boolean;
}

export function CapitalSummary({ data, isLoading = false }: CapitalSummaryProps) {
  if (isLoading) {
    return <CapitalSummaryLoader />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          رأس المال
        </CardTitle>
        <CardDescription>
          الإحصائيات المالية للسنة المالية {data.fiscal_year || new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CapitalDetails data={data} />
        <CapitalIncreaseDialog capitalData={data} />
      </CardContent>
    </Card>
  );
}
