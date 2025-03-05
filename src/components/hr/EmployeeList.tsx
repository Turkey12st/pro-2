
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileDown, Eye } from "lucide-react";
import { Employee, DbEmployee } from "@/types/hr";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
                  <Button variant="ghost" size="icon">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
