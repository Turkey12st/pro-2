
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { FinancialSummaryType } from "@/types/database";

interface FinancialSummaryProps {
  data: FinancialSummaryType;
  isLoading?: boolean;
}

export function FinancialSummary({ data, isLoading = false }: FinancialSummaryProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ملخص الأداء المالي
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

  const { total_income, total_expenses, net_profit, profit_margin } = data;
  const isPositive = net_profit >= 0;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          ملخص الأداء المالي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="text-sm font-medium text-secondary-foreground">إجمالي الإيرادات</h3>
            <p className="text-2xl font-bold mt-2 dir-ltr text-right">{formatNumber(total_income)} ريال</p>
          </div>
          
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="text-sm font-medium text-secondary-foreground">إجمالي المصروفات</h3>
            <p className="text-2xl font-bold mt-2 dir-ltr text-right">{formatNumber(total_expenses)} ريال</p>
          </div>
          
          <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <h3 className="text-sm font-medium">صافي الربح</h3>
            <div className="flex items-center mt-2">
              <p className={`text-2xl font-bold dir-ltr text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatNumber(Math.abs(net_profit))} ريال
              </p>
              {isPositive ? (
                <ArrowUpRight className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${profit_margin >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <h3 className="text-sm font-medium">هامش الربح</h3>
            <div className="flex items-center mt-2">
              <p className={`text-2xl font-bold dir-ltr text-right ${profit_margin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profit_margin.toFixed(1)}%
              </p>
              {profit_margin >= 0 ? (
                <ArrowUpRight className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
