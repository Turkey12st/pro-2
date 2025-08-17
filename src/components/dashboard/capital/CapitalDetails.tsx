import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/utils/formatters";
import { CapitalManagement } from "@/types/database";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CapitalIncreaseDialog } from "./CapitalIncreaseDialog";
import { Plus } from "lucide-react";

interface CapitalDetailsProps {
  data: CapitalManagement;
}

export function CapitalDetails({ data }: CapitalDetailsProps) {
  const { total_capital, available_capital, reserved_capital } = data;
  
  // Calculate the percentage and round it once for efficiency
  const capitalUsagePercentage = total_capital > 0
    ? ((total_capital - available_capital) / total_capital) * 100
    : 0;
  const roundedPercentage = Math.round(capitalUsagePercentage);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <span>{roundedPercentage}%</span>
        </div>
        <Progress value={capitalUsagePercentage} className="h-2" />
      </div>

      <div className="pt-2">
        <Button 
          size="sm" 
          className="w-full" 
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          زيادة رأس المال
        </Button>
      </div>

      <CapitalIncreaseDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        currentCapital={total_capital}
      />
    </div>
  );
}
