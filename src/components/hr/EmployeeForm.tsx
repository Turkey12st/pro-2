
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Employee } from "@/types/hr";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const initialEmployeeState: Omit<Employee, 'id' | 'created_at' | 'created_by'> = {
  name: "",
  identityNumber: "",
  birthDate: "",
  nationality: "",
  position: "",
  department: "",
  salary: 0,
  joiningDate: "",
  contractType: "full-time",
  email: "",
  phone: "",
};

export default function EmployeeForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [photo, setPhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const handleInputChange = (field: keyof typeof initialEmployeeState, value: string | number) => {
    setEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    try {
      let photoUrl = '';
      let documentUrls = [];

      // Upload photo if exists
      if (photo) {
        const photoPath = `${crypto.randomUUID()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('employee-photos')
          .upload(photoPath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('employee-photos')
          .getPublicUrl(photoPath);

        photoUrl = publicUrl;
      }

      // Upload documents if exist
      if (documents.length > 0) {
        for (const doc of documents) {
          const docPath = `${crypto.randomUUID()}-${doc.name}`;
          const { error: uploadError } = await supabase.storage
            .from('employee-files')
            .upload(docPath, doc);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('employee-files')
            .getPublicUrl(docPath);

          documentUrls.push({
            name: doc.name,
            url: publicUrl,
            type: doc.type
          });
        }
      }

      const { error } = await supabase
        .from('employees')
        .insert([{
          ...employee,
          photoUrl,
          documents: documentUrls
        }]);

      if (error) throw error;

      toast({
        title: "تم إضافة الموظف بنجاح",
        description: "تم حفظ بيانات الموظف في قاعدة البيانات",
      });
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccess();
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
          onChange={(e) => handleInputChange("salary", parseFloat(e.target.value))}
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
      <div className="space-y-2">
        <Label>الصورة الشخصية</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </div>
      <div className="space-y-2">
        <Label>المستندات</Label>
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleDocumentsChange}
        />
      </div>
      <div className="col-span-2">
        <Button onClick={handleSubmit} className="w-full">حفظ بيانات الموظف</Button>
      </div>
    </div>
  );
}
