
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartnerData } from './types';

interface BasicInfoFieldsProps {
  partnerData: PartnerData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePartnerTypeChange: (value: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  partnerData,
  handleChange,
  handlePartnerTypeChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">اسم الشريك</Label>
        <Input
          id="name"
          name="name"
          value={partnerData.name}
          onChange={handleChange}
          placeholder="أدخل اسم الشريك"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationality">الجنسية</Label>
          <Input
            id="nationality"
            name="nationality"
            value={partnerData.nationality}
            onChange={handleChange}
            placeholder="أدخل الجنسية"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="identity_number">رقم الهوية</Label>
          <Input
            id="identity_number"
            name="identity_number"
            value={partnerData.identity_number}
            onChange={handleChange}
            placeholder="أدخل رقم الهوية"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="partner_type">نوع الشريك</Label>
        <Select
          value={partnerData.partner_type}
          onValueChange={handlePartnerTypeChange}
        >
          <SelectTrigger id="partner_type">
            <SelectValue placeholder="اختر نوع الشريك" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">فرد</SelectItem>
            <SelectItem value="company">شركة</SelectItem>
            <SelectItem value="organization">مؤسسة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">المنصب</Label>
        <Input
          id="position"
          name="position"
          value={partnerData.position}
          onChange={handleChange}
          placeholder="أدخل المنصب (مثال: شريك، مدير)"
        />
      </div>
    </>
  );
};

export default BasicInfoFields;
