
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileDown, Eye, FileSpreadsheet, FileText } from "lucide-react";
import { Employee, DbEmployee } from "@/types/hr";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmployeeList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      return (data || []).map(emp => ({
        id: emp.id,
        created_at: emp.created_at,
        name: emp.name,
        identityNumber: emp.identity_number,
        birthDate: emp.birth_date,
        nationality: emp.nationality,
        position: emp.position,
        department: emp.department,
        salary: emp.salary,
        joiningDate: emp.joining_date,
        contractType: emp.contract_type as 'full-time' | 'part-time' | 'contract',
        email: emp.email,
        phone: emp.phone,
        photoUrl: emp.photo_url,
        documents: emp.documents as { name: string; url: string; type: string }[] || [],
        created_by: emp.created_by
      })) as Employee[];
    },
  });

  const handleViewDetails = (id: string) => {
    navigate(`/hr/employees/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/hr/employees/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم حذف الموظف بنجاح",
        description: "تم حذف بيانات الموظف من النظام",
      });
      
      // تحديث القائمة بعد الحذف
      refetch();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف الموظف",
        variant: "destructive",
      });
    }
  };

  // تحويل البيانات إلى تنسيق مناسب للتصدير
  const prepareExportData = () => {
    return employees?.map(emp => ({
      "الاسم": emp.name,
      "رقم الهوية": emp.identityNumber,
      "البريد الإلكتروني": emp.email,
      "رقم الهاتف": emp.phone,
      "القسم": emp.department,
      "المنصب": emp.position,
      "الراتب": emp.salary,
      "الجنسية": emp.nationality,
      "نوع العقد": 
        emp.contractType === 'full-time' ? 'دوام كامل' :
        emp.contractType === 'part-time' ? 'دوام جزئي' : 'عقد مؤقت',
      "تاريخ الالتحاق": new Date(emp.joiningDate).toLocaleDateString('ar')
    })) || [];
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = () => {
    try {
      const exportData = prepareExportData();
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "الموظفين");
      
      // تعديل عرض الأعمدة
      const columnWidths = [
        { wch: 20 }, // الاسم
        { wch: 15 }, // رقم الهوية
        { wch: 25 }, // البريد الإلكتروني
        { wch: 15 }, // رقم الهاتف
        { wch: 15 }, // القسم
        { wch: 15 }, // المنصب
        { wch: 10 }, // الراتب
        { wch: 15 }, // الجنسية
        { wch: 15 }, // نوع العقد
        { wch: 15 }, // تاريخ الالتحاق
      ];
      ws['!cols'] = columnWidths;
      
      // تصدير الملف
      XLSX.writeFile(wb, "قائمة_الموظفين.xlsx");
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف Excel",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات",
      });
    }
  };

  // تصدير البيانات إلى CSV
  const exportToCSV = () => {
    try {
      const exportData = prepareExportData();
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, "قائمة_الموظفين.csv");
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف CSV",
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات",
      });
    }
  };

  // تصدير البيانات إلى PDF
  const exportToPDF = () => {
    try {
      const exportData = prepareExportData();
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // إضافة دعم اللغة العربية
      doc.setFont("Helvetica", "normal");
      doc.setR2L(true);
      
      // إنشاء الجدول
      (doc as any).autoTable({
        head: [["تاريخ الالتحاق", "نوع العقد", "الجنسية", "الراتب", "المنصب", "القسم", "رقم الهاتف", "البريد الإلكتروني", "رقم الهوية", "الاسم"]],
        body: exportData.map(item => [
          item["تاريخ الالتحاق"],
          item["نوع العقد"],
          item["الجنسية"],
          item["الراتب"],
          item["المنصب"],
          item["القسم"],
          item["رقم الهاتف"],
          item["البريد الإلكتروني"],
          item["رقم الهوية"],
          item["الاسم"]
        ]),
        theme: 'striped',
        styles: { fontSize: 8, halign: 'right' },
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // حفظ الملف
      doc.save("قائمة_الموظفين.pdf");
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات الموظفين إلى ملف PDF",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات",
      });
    }
  };

  // استيراد بيانات من ملف Excel
  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // معالجة البيانات المستوردة
        toast({
          title: "تم استيراد البيانات بنجاح",
          description: `تم استيراد ${jsonData.length} سجل`,
        });
        
        console.log("Imported data:", jsonData);
        // هنا يمكن إضافة منطق حفظ البيانات في قاعدة البيانات
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error importing from Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء محاولة استيراد البيانات",
      });
    } finally {
      // إعادة تعيين حقل الإدخال
      event.target.value = '';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة مرة أخرى.
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        لا يوجد موظفين حالياً
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              تصدير البيانات
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>اختر صيغة التصدير</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              تصدير كملف Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
              <FileText className="h-4 w-4 ml-2" />
              تصدير كملف CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
              <FilePdf className="h-4 w-4 ml-2" />
              تصدير كملف PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="relative">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => document.getElementById('import-file')?.click()}>
            <FileText className="h-4 w-4" />
            استيراد من ملف
          </Button>
          <input
            type="file"
            id="import-file"
            className="hidden absolute"
            accept=".xlsx,.xls,.csv"
            onChange={importFromExcel}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الموظف</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>المنصب</TableHead>
              <TableHead>نوع العقد</TableHead>
              <TableHead>تاريخ الالتحاق</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={employee.photoUrl} />
                    <AvatarFallback>{employee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  {employee.contractType === 'full-time' ? 'دوام كامل' :
                   employee.contractType === 'part-time' ? 'دوام جزئي' : 'عقد مؤقت'}
                </TableCell>
                <TableCell>{new Date(employee.joiningDate).toLocaleDateString('ar')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDetails(employee.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(employee.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
