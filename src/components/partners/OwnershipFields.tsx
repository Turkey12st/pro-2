
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartnerData } from './types';

interface OwnershipFieldsProps {
  partnerData: PartnerData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OwnershipFields: React.FC<OwnershipFieldsProps> = ({
  partnerData,
  handleChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="ownership_percentage">نسبة الملكية (%)</Label>
        <Input
          id="ownership_percentage"
          name="ownership_percentage"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={partnerData.ownership_percentage}
          onChange={handleChange}
          placeholder="أدخل نسبة الملكية"
          required
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="share_value">قيمة الحصة (ريال)</Label>
        <Input
          id="share_value"
          name="share_value"
          type="number"
          min="0"
          step="0.01"
          value={partnerData.share_value}
          onChange={handleChange}
          placeholder="أدخل قيمة الحصة"
          required
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default OwnershipFields;
