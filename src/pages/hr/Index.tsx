
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/hooks/useSupabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Employee = {
  name: string;
  identityNumber: string;
  birthDate: string;
  nationality: string;
  position: string;
  department: string;
  salary: string;
  joiningDate: string;
  contractType: string;
  email: string;
  phone: string;
};

const initialEmployeeState: Employee = {
  name: "",
  identityNumber: "",
  birthDate: "",
  nationality: "",
  position: "",
  department: "",
  salary: "",
  joiningDate: "",
  contractType: "",
  email: "",
  phone: "",
};

export default function HRPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee>(initialEmployeeState);

  const handleInputChange = (field: keyof Employee, value: string) => {
    setEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .insert([employee]);

      if (error) throw error;

      toast({
        title: "تم إضافة الموظف بنجاح",
        description: "تم حفظ بيانات الموظف في قاعدة البيانات",
      });
      
      setEmployee(initialEmployeeState);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ بيانات الموظف",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              الموارد البشرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة موظف جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                  <DialogDescription>
                    قم بإدخال معلومات الموظف الجديد. جميع الحقول مطلوبة.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم الكامل</Label>
                    <Input
                      value={employee.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="أدخل اسم الموظف"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهوية</Label>
                    <Input
                      value={employee.identityNumber}
                      onChange={(e) => handleInputChange("identityNumber", e.target.value)}
                      placeholder="أدخل رقم الهوية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={employee.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الجنسية</Label>
                    <Input
                      value={employee.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                      placeholder="أدخل الجنسية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المنصب</Label>
                    <Input
                      value={employee.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="أدخل المنصب الوظيفي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>القسم</Label>
                    <Input
                      value={employee.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="أدخل القسم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الراتب</Label>
                    <Input
                      type="number"
                      value={employee.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                      placeholder="أدخل الراتب"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الالتحاق</Label>
                    <Input
                      type="date"
                      value={employee.joiningDate}
                      onChange={(e) => handleInputChange("joiningDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العقد</Label>
                    <Select
                      value={employee.contractType}
                      onValueChange={(value) => handleInputChange("contractType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العقد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">دوام كامل</SelectItem>
                        <SelectItem value="part-time">دوام جزئي</SelectItem>
                        <SelectItem value="contract">عقد مؤقت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={employee.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={employee.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>حفظ بيانات الموظف</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
