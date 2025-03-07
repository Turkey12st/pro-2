
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatSalary } from "@/utils/formatters";

interface EmployeeExportProps {
  employees: any[];
  filteredEmployees: any[];
}

const EmployeeExport: React.FC<EmployeeExportProps> = ({ employees, filteredEmployees }) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.xlsx';
      
      const preparedData = employees.map(emp => ({
        "الاسم": emp.name,
        "البريد الإلكتروني": emp.email,
        "رقم الهاتف": emp.phone,
        "المنصب": emp.position,
        "القسم": emp.department,
        "تاريخ الالتحاق": formatDate(emp.joining_date),
        "الراتب الأساسي": emp.base_salary,
        "بدل السكن": emp.housing_allowance,
        "بدل النقل": emp.transportation_allowance,
        "إجمالي الراتب": emp.salary
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(preparedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "الموظفين");
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // الاسم
        { wch: 25 }, // البريد الإلكتروني
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // المنصب
        { wch: 15 }, // القسم
        { wch: 15 }, // تاريخ الالتحاق
        { wch: 15 }, // الراتب الأساسي
        { wch: 15 }, // بدل السكن
        { wch: 15 }, // بدل النقل
        { wch: 15 }  // إجمالي الراتب
      ];
      worksheet['!cols'] = colWidths;
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      saveAs(data, `قائمة_الموظفين${fileExtension}`);
      
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

  const exportToCSV = () => {
    try {
      const preparedData = employees.map(emp => ({
        "الاسم": emp.name,
        "البريد الإلكتروني": emp.email,
        "رقم الهاتف": emp.phone,
        "المنصب": emp.position,
        "القسم": emp.department,
        "تاريخ الالتحاق": emp.joining_date,
        "الراتب الأساسي": emp.base_salary,
        "بدل السكن": emp.housing_allowance,
        "بدل النقل": emp.transportation_allowance,
        "إجمالي الراتب": emp.salary
      }));
      
      const csv = Papa.unparse(preparedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'قائمة_الموظفين.csv');
      
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

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Add title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("قائمة الموظفين", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Create table data
      const tableColumn = ["الراتب", "القسم", "المنصب", "البريد الإلكتروني", "الاسم"];
      const tableRows = [];
      
      filteredEmployees.forEach(emp => {
        const salaryStr = formatSalary(emp.salary).toString().replace("ر.س.‏", "");
        const employeeData = [
          salaryStr,
          emp.department,
          emp.position,
          emp.email,
          emp.name
        ];
        tableRows.push(employeeData);
      });
      
      // Configure text direction RTL
      doc.setR2L(true);
      
      // Add table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { 
          font: 'helvetica', 
          halign: 'right' 
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        theme: 'grid'
      });
      
      // Save PDF
      doc.save("قائمة_الموظفين.pdf");
      
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
        onClick={exportToExcel}
      >
        <FileSpreadsheet className="h-4 w-4" />
        تصدير إلى Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={exportToCSV}
      >
        <Download className="h-4 w-4" />
        تصدير إلى CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={exportToPDF}
      >
        <FileText className="h-4 w-4" />
        تصدير إلى PDF
      </Button>
    </>
  );
};

export default EmployeeExport;
