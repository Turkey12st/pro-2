
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Users, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalarySummary as SalarySummaryType } from "@/types/database";
import { format, addMonths, differenceInDays, isAfter, isBefore, endOfMonth } from "date-fns";

interface SalarySummaryProps {
  data?: SalarySummaryType;
  isLoading?: boolean;
}

export function SalarySummary({ data, isLoading }: SalarySummaryProps) {
  const [currentSummary, setCurrentSummary] = useState<SalarySummaryType | undefined>(data);

  // استعلام لجلب بيانات الرواتب
  const { data: salaryData, isLoading: isSalaryLoading } = useQuery({
    queryKey: ['salary_summary'],
    queryFn: async () => {
      try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // تعيين تاريخ سداد الرواتب (27 من الشهر الحالي)
        const paymentDate = new Date(currentYear, currentMonth, 27);
        
        // إذا كان تاريخ اليوم بعد 27، ننتقل للشهر التالي
        if (isAfter(today, paymentDate)) {
          paymentDate.setMonth(paymentDate.getMonth() + 1);
        }
        
        // حساب عدد الأيام المتبقية
        const daysRemaining = differenceInDays(paymentDate, today);
        
        // جلب سجلات الرواتب والموظفين
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('id, salary');
        
        if (employeesError) throw employeesError;
        
        // حساب إجمالي الرواتب
        const totalSalaries = employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0;
        
        // تحديد حالة السداد
        let status: 'upcoming' | 'due' | 'overdue' | 'paid' = 'upcoming';
        if (daysRemaining <= 0) {
          status = 'due';
        } else if (daysRemaining <= 5) {
          status = 'upcoming';
        }
        
        // التحقق من وجود سجلات مدفوعة لهذا الشهر
        const { data: paidRecords, error: paidError } = await supabase
          .from('salary_records')
          .select('*')
          .eq('status', 'paid')
          .gte('payment_date', format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd'))
          .lte('payment_date', format(endOfMonth(new Date(currentYear, currentMonth, 1)), 'yyyy-MM-dd'));
        
        if (paidError) throw paidError;
        
        if (paidRecords && paidRecords.length > 0) {
          status = 'paid';
        }
        
        return {
          total_salaries: totalSalaries,
          payment_date: format(paymentDate, 'yyyy-MM-dd'),
          days_remaining: daysRemaining,
          employees_count: employees?.length || 0,
          status: status
        } as SalarySummaryType;
      } catch (error) {
        console.error('Error calculating salary summary:', error);
        return {
          total_salaries: 0,
          payment_date: format(new Date(), 'yyyy-MM-dd'),
          days_remaining: 0,
          employees_count: 0,
          status: 'upcoming'
        } as SalarySummaryType;
      }
    }
  });

  useEffect(() => {
    if (salaryData) {
      setCurrentSummary(salaryData);
    }
  }, [salaryData]);

  if (isLoading || isSalaryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            ملخص الرواتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري تحميل البيانات...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            ملخص الرواتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p>لا توجد بيانات رواتب متاحة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { total_salaries, payment_date, days_remaining, employees_count, status } = currentSummary;

  // نحدد نسبة التقدم بناءً على الأيام المتبقية (نفترض شهر = 30 يوم)
  const progressPercentage = Math.max(0, Math.min(100, ((30 - days_remaining) / 30) * 100));

  const statusInfo = {
    due: { label: 'مستحق الدفع', variant: 'destructive', color: 'text-red-600' },
    upcoming: { label: 'قادم', variant: 'warning', color: 'text-amber-600' },
    overdue: { label: 'متأخر', variant: 'destructive', color: 'text-red-600' },
    paid: { label: 'مدفوع', variant: 'success', color: 'text-green-600' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            ملخص الرواتب
          </span>
          <Badge 
            variant={
              status === 'paid' ? 'outline' : 
              status === 'due' ? 'destructive' : 
              'outline'
            }
            className={
              status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
              status === 'upcoming' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
              'bg-red-100 text-red-800 hover:bg-red-200'
            }
          >
            {statusInfo[status].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <DollarSign className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm text-muted-foreground">إجمالي الرواتب</span>
            <span className="text-xl font-bold mt-1 dir-ltr">{total_salaries.toLocaleString()} ريال</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <Users className="h-8 w-8 mb-2 text-primary" />
            <span className="text-sm text-muted-foreground">عدد الموظفين</span>
            <span className="text-xl font-bold mt-1">{employees_count}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">تاريخ السداد:</span>
            </div>
            <span className="text-sm">{format(new Date(payment_date), 'yyyy/MM/dd')}</span>
          </div>
          
          {status !== 'paid' && (
            <>
              <Progress value={progressPercentage} className="h-2 mb-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">الشهر الحالي</span>
                <span className={`text-sm font-medium ${statusInfo[status].color}`}>
                  {days_remaining > 0 ? `${days_remaining} يوم متبقي` : 'مستحق اليوم'}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      {status !== 'paid' && (
        <CardFooter>
          <Button className="w-full" variant={status === 'due' ? 'default' : 'outline'}>
            إدارة الرواتب
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
