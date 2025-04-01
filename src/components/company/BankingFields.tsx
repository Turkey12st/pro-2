
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CompanyInfo } from "@/types/database";

interface BankingFieldsProps {
  formData: Partial<CompanyInfo>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BankingFields: React.FC<BankingFieldsProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="bank_name">اسم البنك</Label>
        <Input
          id="bank_name"
          name="bank_name"
          value={formData?.bank_name || ''}
          onChange={handleInputChange}
          placeholder="أدخل اسم البنك"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bank_iban">رقم الآيبان</Label>
        <Input
          id="bank_iban"
          name="bank_iban"
          value={formData?.bank_iban || ''}
          onChange={handleInputChange}
          placeholder="SA00 0000 0000 0000 0000 0000"
          dir="ltr"
        />
      </div>
    </div>
  );
};
