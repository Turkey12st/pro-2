
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/hr";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PersonalInfo from "./PersonalInfo";
import JobInfo from "./JobInfo";
import FileUpload from "./FileUpload";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول لإضافة موظف');
      }

      let photoUrl = '';
      let documentUrls = [];

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
          name: employee.name,
          identity_number: employee.identityNumber,
          birth_date: employee.birthDate,
          nationality: employee.nationality,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
          joining_date: employee.joiningDate,
          contract_type: employee.contractType,
          email: employee.email,
          phone: employee.phone,
          photo_url: photoUrl,
          documents: documentUrls,
          created_by: user.id
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PersonalInfo
        name={employee.name}
        identityNumber={employee.identityNumber}
        birthDate={employee.birthDate}
        nationality={employee.nationality}
        email={employee.email}
        phone={employee.phone}
        onInputChange={handleInputChange}
      />
      <JobInfo
        position={employee.position}
        department={employee.department}
        salary={employee.salary}
        joiningDate={employee.joiningDate}
        contractType={employee.contractType}
        onInputChange={handleInputChange}
      />
      <FileUpload
        onPhotoChange={handlePhotoChange}
        onDocumentsChange={handleDocumentsChange}
      />
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري الحفظ..." : "حفظ بيانات الموظف"}
      </Button>
    </div>
  );
}
