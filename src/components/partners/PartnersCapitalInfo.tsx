
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

interface CapitalInfoProps {
  totalCapital: number;
  partnersCount: number;
}

export function PartnersCapitalInfo({ totalCapital, partnersCount }: CapitalInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي رأس المال</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalCapital)} ريال</div>
          <p className="text-xs text-muted-foreground">
            إجمالي رأس مال الشركة المسجل
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد الشركاء</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{partnersCount}</div>
          <p className="text-xs text-muted-foreground">
            إجمالي عدد الشركاء والمساهمين
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
