
import React from "react";
import { TrendingUp, Users, Building } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

interface CapitalStatsProps {
  totalCapital: number;
  individualCapital: number;
  corporateCapital: number;
}

export function CapitalStats({ 
  totalCapital, 
  individualCapital, 
  corporateCapital 
}: CapitalStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg flex items-center">
        <TrendingUp className="h-10 w-10 text-blue-500 ml-4" />
        <div>
          <p className="text-sm text-muted-foreground">إجمالي رأس المال</p>
          <p className="text-xl font-bold">{formatNumber(totalCapital)} ريال</p>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg flex items-center">
        <Users className="h-10 w-10 text-green-500 ml-4" />
        <div>
          <p className="text-sm text-muted-foreground">رأس مال الأفراد</p>
          <p className="text-xl font-bold">{formatNumber(individualCapital)} ريال</p>
          <p className="text-xs text-muted-foreground">
            {totalCapital > 0 ? 
              `${((individualCapital / totalCapital) * 100).toFixed(1)}%` : 
              "0%"}
          </p>
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg flex items-center">
        <Building className="h-10 w-10 text-purple-500 ml-4" />
        <div>
          <p className="text-sm text-muted-foreground">رأس مال الشركات</p>
          <p className="text-xl font-bold">{formatNumber(corporateCapital)} ريال</p>
          <p className="text-xs text-muted-foreground">
            {totalCapital > 0 ? 
              `${((corporateCapital / totalCapital) * 100).toFixed(1)}%` : 
              "0%"}
          </p>
        </div>
      </div>
    </div>
  );
}
