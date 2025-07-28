import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/hr";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PersonalInfo from "./PersonalInfo";
import JobInfo from "./JobInfo";
import FileUpload from "./FileUpload";
import { validateAndSanitizeFormData, employeeSchema, validateFileUpload } from "@/lib/validation";

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
  baseSalary: 0,
  housingAllowance: 0,
  transportationAllowance: 0,
  otherAllowances: [],
  gosiSubscription: 0,
  employeeGosiContribution: 0,
  companyGosiContribution: 0,
  medicalInsuranceCost: 0,
  visaFees: 0,
  transferFees: 0,
  laborFees: 0
};

export default function EmployeeForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [photo, setPhoto] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof initialEmployeeState, value: string | number) => {
    if (field === "baseSalary" || field === "housingAllowance" || field === "transportationAllowance") {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      setEmployee(prev => ({
        ...prev,
        [field]: numValue,
        salary: prev.baseSalary + prev.housingAllowance + prev.transportationAllowance + (field === "baseSalary" ? numValue - prev.baseSalary : 0) + (field === "housingAllowance" ? numValue - prev.housingAllowance : 0) + (field === "transportationAllowance" ? numValue - prev.transportationAllowance : 0)
      }));
    } else {
      setEmployee(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        validateFileUpload(e.target.files[0]);
        setPhoto(e.target.files[0]);
      } catch (error) {
        toast({
          title: "خطأ في رفع الصورة",
          description: error instanceof Error ? error.message : "ملف غير صالح",
          variant: "destructive",
        });
      }
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const files = Array.from(e.target.files);
        files.forEach(file => validateFileUpload(file));
        setDocuments(files);
      } catch (error) {
        toast({
          title: "خطأ في رفع المستندات",
          description: error instanceof Error ? error.message : "ملف غير صالح",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول لإضافة موظف');
      }

      // Validate employee data
      const validationData = {
        name: employee.name,
        identity_number: employee.identityNumber,
        email: employee.email,
        phone: employee.phone,
        salary: employee.salary,
        birth_date: employee.birthDate,
        joining_date: employee.joiningDate,
        position: employee.position,
        department: employee.department,
        nationality: employee.nationality,
        contract_type: employee.contractType
      };

      const validation = validateAndSanitizeFormData(validationData, employeeSchema);
      if (!validation.success) {
        toast({
          title: "خطأ في البيانات",
          description: validation.errors?.join(', ') || "البيانات غير صحيحة",
          variant: "destructive",
        });
        return;
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
          base_salary: employee.baseSalary,
          housing_allowance: employee.housingAllowance,
          transportation_allowance: employee.transportationAllowance,
          other_allowances: employee.otherAllowances,
          gosi_subscription: employee.gosiSubscription,
          employee_gosi_contribution: employee.employeeGosiContribution,
          company_gosi_contribution: employee.companyGosiContribution,
          medical_insurance_cost: employee.medicalInsuranceCost,
          visa_fees: employee.visaFees,
          transfer_fees: employee.transferFees,
          labor_fees: employee.laborFees,
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
        baseSalary={employee.baseSalary}
        housingAllowance={employee.housingAllowance}
        transportationAllowance={employee.transportationAllowance}
        gosiSubscription={employee.gosiSubscription}
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
