
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CompanyInfo } from "@/types/database";

interface ActivityFieldsProps {
  formData: Partial<CompanyInfo>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ActivityFields: React.FC<ActivityFieldsProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="economic_activity">النشاط الاقتصادي</Label>
        <Input
          id="economic_activity"
          name="economic_activity"
          value={formData?.economic_activity || ''}
          onChange={handleInputChange}
          placeholder="أدخل النشاط الاقتصادي"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nitaqat_activity">نشاط نطاقات</Label>
        <Input
          id="nitaqat_activity"
          name="nitaqat_activity"
          value={formData?.nitaqat_activity || ''}
          onChange={handleInputChange}
          placeholder="أدخل نشاط نطاقات"
        />
      </div>
    </div>
  );
};
