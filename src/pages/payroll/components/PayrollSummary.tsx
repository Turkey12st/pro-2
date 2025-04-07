
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { Banknote, Users, CalendarDays, Receipt, Wallet, TrendingUp } from "lucide-react";

interface PayrollSummaryProps {
  summary: {
    totalEmployees: number;
    totalBaseSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalGosi: number;
    totalNetSalary: number;
  };
  paymentDate?: string;
}

export function PayrollSummary({ summary, paymentDate }: PayrollSummaryProps) {
  const { 
    totalEmployees, 
    totalBaseSalary, 
    totalAllowances, 
    totalDeductions, 
    totalGosi, 
    totalNetSalary 
  } = summary;

  let displayDate = "هذا الشهر";
  if (paymentDate) {
    displayDate = format(new Date(paymentDate), "MMMM yyyy");
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">مجموع الرواتب</p>
              <p className="text-2xl font-bold">{formatNumber(totalNetSalary)} ريال</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded">
            <div 
              className="h-full bg-primary rounded"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            كشف رواتب {displayDate}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">عدد الموظفين</p>
            </div>
            <p className="text-lg font-bold mt-1">{totalEmployees}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">الدفع</p>
            </div>
            <p className="text-lg font-bold mt-1">
              {paymentDate ? format(new Date(paymentDate), "yyyy/MM/dd") : "-"}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">الأساسي</p>
            </div>
            <p className="text-lg font-bold mt-1">{formatNumber(totalBaseSalary)}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">البدلات</p>
            </div>
            <p className="text-lg font-bold mt-1">{formatNumber(totalAllowances)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">إجمالي الرواتب الأساسية</p>
              <p className="text-sm font-bold">{formatNumber(totalBaseSalary)}</p>
            </div>
            <div className="mt-1 h-1 w-full bg-muted overflow-hidden rounded">
              <div 
                className="h-full bg-blue-500 rounded"
                style={{ width: `${(totalBaseSalary / totalNetSalary) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">إجمالي البدلات</p>
              <p className="text-sm font-bold">{formatNumber(totalAllowances)}</p>
            </div>
            <div className="mt-1 h-1 w-full bg-muted overflow-hidden rounded">
              <div 
                className="h-full bg-green-500 rounded"
                style={{ width: `${(totalAllowances / totalNetSalary) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">إجمالي الخصومات</p>
              <p className="text-sm font-bold">{formatNumber(totalDeductions)}</p>
            </div>
            <div className="mt-1 h-1 w-full bg-muted overflow-hidden rounded">
              <div 
                className="h-full bg-red-500 rounded"
                style={{ width: `${(totalDeductions / totalNetSalary) * 20}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">إجمالي التأمينات</p>
              <p className="text-sm font-bold">{formatNumber(totalGosi)}</p>
            </div>
            <div className="mt-1 h-1 w-full bg-muted overflow-hidden rounded">
              <div 
                className="h-full bg-amber-500 rounded"
                style={{ width: `${(totalGosi / totalNetSalary) * 20}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
