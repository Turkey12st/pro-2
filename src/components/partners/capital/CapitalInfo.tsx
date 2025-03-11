
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCapitalData } from "./useCapitalData";
import { CapitalStats } from "./CapitalStats";
import { CapitalChart } from "./CapitalChart";

export default function CapitalInfo() {
  const { capitalData, chartData, isLoading } = useCapitalData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Coins className="mr-2 h-5 w-5" />
          توزيع رأس المال بين الشركاء
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CapitalStats 
          totalCapital={capitalData.total_capital}
          individualCapital={capitalData.individual_capital}
          corporateCapital={capitalData.corporate_capital}
        />
        <CapitalChart chartData={chartData} />
      </CardContent>
    </Card>
  );
}
