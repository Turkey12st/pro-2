
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CompanyInfo } from "@/types/database";

interface AddressFieldsProps {
  formData: Partial<CompanyInfo>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="space-y-2">
      <Label>العنوان</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          id="address.street"
          name="address.street"
          value={(formData?.address as any)?.street || ''}
          onChange={handleInputChange}
          placeholder="الشارع"
        />
        <Input
          id="address.city"
          name="address.city"
          value={(formData?.address as any)?.city || ''}
          onChange={handleInputChange}
          placeholder="المدينة"
        />
        <Input
          id="address.postal_code"
          name="address.postal_code"
          value={(formData?.address as any)?.postal_code || ''}
          onChange={handleInputChange}
          placeholder="الرمز البريدي"
          dir="ltr"
        />
      </div>
    </div>
  );
};
