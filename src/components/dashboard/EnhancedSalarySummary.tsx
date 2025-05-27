
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SalaryAlerts } from "./SalaryAlerts";
import { Wallet, Users, Calendar, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { differenceInDays } from "date-fns";

interface EnhancedSalarySummaryProps {
  data: {
    total_salaries: number;
    payment_date: string;
    days_remaining: number;
    employees_count: number;
    status: "upcoming" | "overdue" | "paid";
  };
}

export function EnhancedSalarySummary({ data }: EnhancedSalarySummaryProps) {
  const { total_salaries, payment_date, days_remaining, employees_count, status } = data;
  
  const getStatusColor = () => {
    if (days_remaining <= 1) return "text-red-600 dark:text-red-400";
    if (days_remaining <= 3) return "text-orange-600 dark:text-orange-400";
    if (days_remaining <= 5) return "text-yellow-600 dark:text-yellow-400";
    if (days_remaining <= 10) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressColor = () => {
    if (days_remaining <= 1) return "bg-red-500";
    if (days_remaining <= 3) return "bg-orange-500";
    if (days_remaining <= 5) return "bg-yellow-500";
    if (days_remaining <= 10) return "bg-blue-500";
    return "bg-green-500";
  };

  const progressValue = Math.max(0, Math.min(100, (30 - days_remaining) / 30 * 100));

  return (
    <div className="space-y-4">
      <SalaryAlerts 
        paymentDate={payment_date} 
        totalSalaries={total_salaries} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            ملخص الرواتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">إجمالي الرواتب</span>
              </div>
              <p className={`text-2xl font-bold dir-ltr text-right ${getStatusColor()}`}>
                {formatNumber(total_salaries)} ريال
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">عدد الموظفين</span>
              </div>
              <p className="text-2xl font-bold">{employees_count}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">موعد الدفع</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(payment_date).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">الأيام المتبقية</span>
              <div className="flex items-center gap-2">
                {days_remaining <= 3 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                <span className={`font-bold ${getStatusColor()}`}>
                  {days_remaining} يوم
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={progressValue} 
                className="w-full"
                style={{
                  '--progress-background': getProgressColor()
                } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>بداية الشهر</span>
                <span>موعد الدفع</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <Badge variant={days_remaining <= 3 ? "destructive" : "secondary"}>
              {status === "upcoming" ? "قادم" : status === "overdue" ? "متأخر" : "مدفوع"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
