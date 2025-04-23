
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatSalary } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeTableProps {
  employees: any[];
  onDelete?: (id: string) => Promise<boolean>;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الموظف؟")) {
      if (onDelete) {
        await onDelete(id);
      }
    }
  };

  const getEmployeeTypeDisplay = (type: string) => {
    switch (type) {
      case 'saudi':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">سعودي</Badge>;
      case 'expat':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">وافد</Badge>;
      default:
        return <Badge variant="outline">{type || "غير محدد"}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهوية</TableHead>
            <TableHead className="text-right">المنصب</TableHead>
            <TableHead className="text-right">القسم</TableHead>
            <TableHead className="text-right">تاريخ الالتحاق</TableHead>
            <TableHead className="text-right">الراتب</TableHead>
            <TableHead className="text-right">نوع العمالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                لا توجد بيانات للعرض
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name || "غير محدد"}</TableCell>
                <TableCell>{employee.identity_number || "غير محدد"}</TableCell>
                <TableCell>{employee.position || "غير محدد"}</TableCell>
                <TableCell>{employee.department || "غير محدد"}</TableCell>
                <TableCell>{formatDate(employee.joining_date)}</TableCell>
                <TableCell>{formatSalary(employee.salary)}</TableCell>
                <TableCell>{getEmployeeTypeDisplay(employee.employee_type)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/hr/employee/${employee.id}`)}>
                      <Eye className="h-4 w-4 ml-1" /> عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/hr/employees/edit/${employee.id}`)}>
                      <Pencil className="h-4 w-4 ml-1" /> تعديل
                    </Button>
                    {onDelete && (
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(employee.id)}>
                        <Trash className="h-4 w-4 ml-1" /> حذف
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
