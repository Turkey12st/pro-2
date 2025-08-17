import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { HRPermissionGate } from "./HRPermissionGate";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  User, 
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  FileText,
  Phone,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface EnhancedEmployeeTableProps {
  employees: any[];
}

const EnhancedEmployeeTable: React.FC<EnhancedEmployeeTableProps> = ({ employees }) => {
  const navigate = useNavigate();
  const { deleteEmployee } = useEmployees();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف الموظف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
    );
    
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const success = await deleteEmployee(id);
      if (success) {
        toast({
          title: "تم الحذف بنجاح",
          description: `تم حذف الموظف "${name}" من النظام.`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف الموظف.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getEmployeeTypeDisplay = (type: string) => {
    const types = {
      saudi: { label: "سعودي", variant: "default" as const },
      non_saudi: { label: "غير سعودي", variant: "secondary" as const },
      contract: { label: "متعاقد", variant: "outline" as const },
    };
    return types[type as keyof typeof types] || { label: type, variant: "outline" as const };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEmployeeInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>الموظف</TableHead>
            <TableHead>معلومات التواصل</TableHead>
            <TableHead>الوظيفة</TableHead>
            <TableHead>الراتب</TableHead>
            <TableHead>تاريخ الالتحاق</TableHead>
            <TableHead>الأداء</TableHead>
            <TableHead>نوع الموظف</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const typeDisplay = getEmployeeTypeDisplay(employee.employee_type || 'saudi');
            const performanceScore = employee.integrated_performance?.score || 0;
            const joinDate = new Date(employee.joining_date || '');
            const timeInCompany = formatDistanceToNow(joinDate, { 
              addSuffix: true, 
              locale: ar 
            });

            return (
              <TableRow key={employee.id} className="hover:bg-muted/30">
                {/* Employee Info */}
                <TableCell>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.photo_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getEmployeeInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {employee.employment_number || employee.identity_number}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Contact Info */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {employee.phone}
                    </div>
                  </div>
                </TableCell>

                {/* Job Info */}
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.position}</div>
                    <div className="text-sm text-muted-foreground">{employee.department}</div>
                    {employee.branch && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {employee.branch}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Salary */}
                <TableCell>
                  <div>
                    <div className="font-semibold">{formatSalary(employee.salary || 0)}</div>
                    {employee.financial_summary?.total_cost && (
                      <div className="text-xs text-muted-foreground">
                        التكلفة الإجمالية: {formatSalary(employee.financial_summary.total_cost)}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Joining Date */}
                <TableCell>
                  <div>
                    <div className="text-sm">{joinDate.toLocaleDateString('ar-SA')}</div>
                    <div className="text-xs text-muted-foreground">{timeInCompany}</div>
                  </div>
                </TableCell>

                {/* Performance */}
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getPerformanceColor(performanceScore)}`}>
                        {performanceScore}%
                      </span>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress value={performanceScore} className="h-1" />
                    {employee.integrated_performance && (
                      <div className="text-xs text-muted-foreground">
                        المشاريع: {employee.integrated_performance.projects_count || 0}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Employee Type */}
                <TableCell>
                  <Badge variant={typeDisplay.variant}>
                    {typeDisplay.label}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => navigate(`/hr/employee/${employee.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      
                      <HRPermissionGate action="update" resource="employees" showMessage={false}>
                        <DropdownMenuItem
                          onClick={() => navigate(`/hr/employee/${employee.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          تعديل
                        </DropdownMenuItem>
                      </HRPermissionGate>

                      <DropdownMenuItem
                        onClick={() => navigate(`/hr/employee/${employee.id}/documents`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        المستندات
                      </DropdownMenuItem>

                      <HRPermissionGate action="manage_salaries" resource="salaries" showMessage={false}>
                        <DropdownMenuItem
                          onClick={() => navigate(`/hr/employee/${employee.id}/salary`)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          إدارة الراتب
                        </DropdownMenuItem>
                      </HRPermissionGate>

                      <DropdownMenuSeparator />

                      <HRPermissionGate action="delete" resource="employees" showMessage={false}>
                        <DropdownMenuItem
                          onClick={() => handleDelete(employee.id, employee.name)}
                          disabled={deletingId === employee.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === employee.id ? "جاري الحذف..." : "حذف"}
                        </DropdownMenuItem>
                      </HRPermissionGate>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default EnhancedEmployeeTable;