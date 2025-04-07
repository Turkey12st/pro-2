
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/utils/formatters";
import { CapitalManagement } from "@/types/database";

interface CapitalDetailsProps {
  data: CapitalManagement;
}

export function CapitalDetails({ data }: CapitalDetailsProps) {
  const { total_capital, available_capital, reserved_capital } = data;
  const capitalUsagePercentage = total_capital > 0 
    ? ((total_capital - available_capital) / total_capital) * 100 
    : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">رأس المال الكلي</span>
          <span className="text-sm font-bold dir-ltr">{formatNumber(total_capital)} ريال</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">رأس المال المتاح</span>
          <span className="text-sm font-bold dir-ltr">{formatNumber(available_capital)} ريال</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">رأس المال المحجوز</span>
          <span className="text-sm font-bold dir-ltr">{formatNumber(reserved_capital)} ريال</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>نسبة استخدام رأس المال</span>
          <span>{Math.round(capitalUsagePercentage)}%</span>
        </div>
        <Progress value={capitalUsagePercentage} className="h-2" />
      </div>
    </div>
  );
}
