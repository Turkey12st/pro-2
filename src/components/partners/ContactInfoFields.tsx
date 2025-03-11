
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartnerData } from './types';

interface ContactInfoFieldsProps {
  partnerData: PartnerData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  partnerData,
  handleChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={partnerData.contact_info.email}
          onChange={handleChange}
          placeholder="أدخل البريد الإلكتروني"
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          name="phone"
          value={partnerData.contact_info.phone}
          onChange={handleChange}
          placeholder="أدخل رقم الهاتف"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default ContactInfoFields;
