
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FinancialReports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("income-statement");
  const [period, setPeriod] = useState<string>("current-month");

  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['journal-entries-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleGenerateReport = () => {
    toast({
      title: "جاري إنشاء التقرير",
      description: `جاري إنشاء ${getReportTypeName(reportType)} للفترة ${getPeriodName(period)}`,
    });

    // يمكن إضافة المزيد من المنطق هنا لإنشاء التقرير بناءً على النوع والفترة المحددة
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case "income-statement": return "قائمة الدخل";
      case "balance-sheet": return "قائمة المركز المالي";
      case "cash-flow": return "قائمة التدفقات النقدية";
      case "general-ledger": return "دفتر الأستاذ العام";
      default: return "التقرير";
    }
  };

  const getPeriodName = (p: string) => {
    switch (p) {
      case "current-month": return "الشهر الحالي";
      case "previous-month": return "الشهر السابق";
      case "current-quarter": return "الربع الحالي";
      case "year-to-date": return "منذ بداية العام";
      case "previous-year": return "العام السابق";
      default: return "المحددة";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">إنشاء تقرير مالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income-statement">قائمة الدخل</SelectItem>
                  <SelectItem value="balance-sheet">قائمة المركز المالي</SelectItem>
                  <SelectItem value="cash-flow">قائمة التدفقات النقدية</SelectItem>
                  <SelectItem value="general-ledger">دفتر الأستاذ العام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">الشهر الحالي</SelectItem>
                  <SelectItem value="previous-month">الشهر السابق</SelectItem>
                  <SelectItem value="current-quarter">الربع الحالي</SelectItem>
                  <SelectItem value="year-to-date">منذ بداية العام</SelectItem>
                  <SelectItem value="previous-year">العام السابق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="w-full mt-6 flex items-center gap-2 justify-center"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4" />
            إنشاء {getReportTypeName(reportType)}
          </Button>
        </CardContent>
      </Card>

      {journalEntries && journalEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex justify-between items-center">
              <span>التقارير الحالية</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
              هنا سيتم عرض التقارير بعد إنشائها
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
