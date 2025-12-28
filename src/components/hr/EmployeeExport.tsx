import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/formatters";
import { exportToExcel, exportToCSV, exportToPDF, ColumnDefinition } from "@/utils/exportHelpers";

interface EmployeeExportProps {
  employees: any[];
  filteredEmployees: any[];
}

const EmployeeExport: React.FC<EmployeeExportProps> = ({ employees, filteredEmployees }) => {
  const { toast } = useToast();

  // تعريف الأعمدة
  const columns: ColumnDefinition[] = [
    { header: "الاسم", key: "name", width: 20 },
    { header: "البريد الإلكتروني", key: "email", width: 25 },
    { header: "رقم الهاتف", key: "phone", width: 15 },
    { header: "المنصب", key: "position", width: 15 },
    { header: "القسم", key: "department", width: 15 },
    { header: "تاريخ الالتحاق", key: "joining_date_formatted", width: 15 },
    { header: "الراتب الأساسي", key: "base_salary", width: 15 },
    { header: "بدل السكن", key: "housing_allowance", width: 15 },
    { header: "بدل النقل", key: "transportation_allowance", width: 15 },
    { header: "إجمالي الراتب", key: "salary", width: 15 },
  ];

  // تحضير البيانات للتصدير
  const prepareData = (data: any[]) => {
    return data.map(emp => ({
      ...emp,
      joining_date_formatted: formatDate(emp.joining_date),
      base_salary: emp.base_salary || 0,
      housing_allowance: emp.housing_allowance || 0,
      transportation_allowance: emp.transportation_allowance || 0,
      salary: emp.salary || 0
    }));
  };

  const exportToExcelHandler = () => {
    try {
      const data = prepareData(employees);
      exportToExcel(data, columns, {
        filename: 'قائمة_الموظفين',
        sheetName: 'الموظفين',
        title: 'قائمة الموظفين'
      });
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف إكسل.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات.",
        variant: "destructive",
      });
    }
  };

  const exportToCSVHandler = () => {
    try {
      const data = prepareData(employees);
      exportToCSV(data, columns, {
        filename: 'قائمة_الموظفين'
      });
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف CSV.",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات.",
        variant: "destructive",
      });
    }
  };

  const exportToPDFHandler = () => {
    try {
      const data = prepareData(filteredEmployees);
      exportToPDF(data, columns, {
        filename: 'قائمة_الموظفين',
        title: 'قائمة الموظفين'
      });
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف PDF.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={exportToExcelHandler}
      >
        <FileSpreadsheet className="h-4 w-4" />
        تصدير إلى Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={exportToCSVHandler}
      >
        <Download className="h-4 w-4" />
        تصدير إلى CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={exportToPDFHandler}
      >
        <FileText className="h-4 w-4" />
        تصدير إلى PDF
      </Button>
    </>
  );
};

export default EmployeeExport;
