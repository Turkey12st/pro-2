
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyInfo } from "@/types/database";

interface BasicInfoFieldsProps {
  formData: Partial<CompanyInfo>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  handleInputChange,
  handleSelectChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="company_name">اسم الشركة</Label>
        <Input
          id="company_name"
          name="company_name"
          value={formData?.company_name || ''}
          onChange={handleInputChange}
          placeholder="أدخل اسم الشركة"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company_type">نوع الشركة</Label>
        <Select
          value={formData?.company_type || ''}
          onValueChange={(value) => handleSelectChange('company_type', value)}
        >
          <SelectTrigger id="company_type">
            <SelectValue placeholder="اختر نوع الشركة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="مساهمة">شركة مساهمة</SelectItem>
            <SelectItem value="ذات مسؤولية محدودة">ذات مسؤولية محدودة</SelectItem>
            <SelectItem value="تضامنية">شركة تضامنية</SelectItem>
            <SelectItem value="توصية بسيطة">شركة توصية بسيطة</SelectItem>
            <SelectItem value="مهنية">شركة مهنية</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
