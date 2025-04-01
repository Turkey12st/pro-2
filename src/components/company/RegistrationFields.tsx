
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CompanyInfo } from "@/types/database";

interface RegistrationFieldsProps {
  formData: Partial<CompanyInfo>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const RegistrationFields: React.FC<RegistrationFieldsProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="commercial_registration">رقم السجل التجاري</Label>
        <Input
          id="commercial_registration"
          name="commercial_registration"
          value={formData?.commercial_registration || ''}
          onChange={handleInputChange}
          placeholder="أدخل رقم السجل التجاري"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="establishment_date">تاريخ التأسيس</Label>
        <Input
          id="establishment_date"
          name="establishment_date"
          value={formData?.establishment_date || ''}
          onChange={handleInputChange}
          placeholder="مثال: ١٤٤٢/٠٧/١٥"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="unified_national_number">الرقم الموحد</Label>
        <Input
          id="unified_national_number"
          name="unified_national_number"
          value={formData?.unified_national_number || ''}
          onChange={handleInputChange}
          placeholder="أدخل الرقم الموحد"
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="social_insurance_number">رقم التأمينات الاجتماعية</Label>
        <Input
          id="social_insurance_number"
          name="social_insurance_number"
          value={formData?.social_insurance_number || ''}
          onChange={handleInputChange}
          placeholder="أدخل رقم التأمينات الاجتماعية"
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hrsd_number">رقم وزارة الموارد البشرية</Label>
        <Input
          id="hrsd_number"
          name="hrsd_number"
          value={formData?.hrsd_number || ''}
          onChange={handleInputChange}
          placeholder="أدخل رقم وزارة الموارد البشرية"
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tax_number">الرقم الضريبي</Label>
        <Input
          id="tax_number"
          name="tax_number"
          value={formData?.tax_number || ''}
          onChange={handleInputChange}
          placeholder="أدخل الرقم الضريبي"
          dir="ltr"
        />
      </div>
    </div>
  );
};
