
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

export function CashFlowChart() {
  // Sample cash flow data - in a real app, this would come from the database
  const cashFlowData = {
    total_inflow: 850000,
    total_outflow: 675000,
    net_flow: 175000,
    flow_ratio: 25.9
  };

  const { total_inflow, total_outflow, net_flow, flow_ratio } = cashFlowData;
  const isPositive = net_flow >= 0;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          التدفق النقدي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="text-sm font-medium text-secondary-foreground">إجمالي التدفق الداخل</h3>
            <div className="flex items-center mt-2">
              <p className="text-2xl font-bold dir-ltr text-right text-green-600 dark:text-green-400">
                {formatNumber(total_inflow)} ريال
              </p>
              <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="p-4 bg-secondary/20 rounded-lg">
            <h3 className="text-sm font-medium text-secondary-foreground">إجمالي التدفق الخارج</h3>
            <div className="flex items-center mt-2">
              <p className="text-2xl font-bold dir-ltr text-right text-red-600 dark:text-red-400">
                {formatNumber(total_outflow)} ريال
              </p>
              <TrendingDown className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <h3 className="text-sm font-medium">صافي التدفق النقدي</h3>
            <div className="flex items-center mt-2">
              <p className={`text-2xl font-bold dir-ltr text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatNumber(Math.abs(net_flow))} ريال
              </p>
              {isPositive ? (
                <ArrowUpRight className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${flow_ratio >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <h3 className="text-sm font-medium">نسبة التدفق</h3>
            <div className="flex items-center mt-2">
              <p className={`text-2xl font-bold dir-ltr text-right ${flow_ratio >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {flow_ratio.toFixed(1)}%
              </p>
              {flow_ratio >= 0 ? (
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
