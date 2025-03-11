
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2, Calculator, FileText } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface HRDashboardCardsProps {
  totalEmployees: number;
  newEmployeesCount: number;
  totalSalaries: number;
  totalGosi: number;
}

export function HRDashboardCards({
  totalEmployees,
  newEmployeesCount,
  totalSalaries,
  totalGosi
}: HRDashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">
            +{newEmployeesCount} موظف جديد هذا الشهر
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalSalaries)} ريال</div>
          <p className="text-xs text-muted-foreground">
            تم تحديث التكاليف آخر مرة اليوم
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التأمينات الاجتماعية</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalGosi)} ريال</div>
          <p className="text-xs text-muted-foreground">
            مستحقات التأمينات الشهرية
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
