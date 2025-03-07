
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Upload, Search, FileSpreadsheet } from "lucide-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [importFile, setImportFile] = useState(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) throw error;
      
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات الموظفين.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA').format(date);
  };

  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "غير محدد";
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(salary);
  };

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

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      processImportedFile(file);
    }
  };

  const processImportedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error("الملف لا يحتوي على بيانات");
        }
        
        // Process the imported data
        // In a real application, you would validate and transform this data
        // and then send it to your database
        
        console.log("Imported data:", jsonData);
        
        toast({
          title: "تم استيراد البيانات",
          description: `تم استيراد ${jsonData.length} سجل بنجاح.`,
        });
        
        // In a real app, you would update the database and then refetch:
        // fetchEmployees();
        
      } catch (error) {
        console.error("Error processing imported file:", error);
        toast({
          title: "خطأ في معالجة الملف",
          description: error.message || "حدث خطأ أثناء معالجة الملف المستورد.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast({
        title: "خطأ في قراءة الملف",
        description: "حدث خطأ أثناء محاولة قراءة الملف.",
        variant: "destructive",
      });
    };
    
    reader.readAsBinaryString(file);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن موظف..." 
              className="pl-3 pr-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4" />
              استيراد من Excel
            </Button>
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
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">المنصب</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">تاريخ الالتحاق</TableHead>
                  <TableHead className="text-right">الراتب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{formatDate(employee.joining_date)}</TableCell>
                    <TableCell>{formatSalary(employee.salary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
