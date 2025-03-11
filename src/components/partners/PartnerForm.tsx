
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartnerFormProps } from './types';
import { usePartnerForm } from './usePartnerForm';
import BasicInfoFields from './BasicInfoFields';
import OwnershipFields from './OwnershipFields';
import ContactInfoFields from './ContactInfoFields';

const PartnerForm: React.FC<PartnerFormProps> = ({ onSuccess }) => {
  const {
    partnerData,
    isLoading,
    handleChange,
    handlePartnerTypeChange,
    handleSubmit
  } = usePartnerForm(onSuccess);

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <BasicInfoFields 
            partnerData={partnerData}
            handleChange={handleChange}
            handlePartnerTypeChange={handlePartnerTypeChange}
          />
          
          <OwnershipFields 
            partnerData={partnerData}
            handleChange={handleChange}
          />
          
          <ContactInfoFields 
            partnerData={partnerData}
            handleChange={handleChange}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "إضافة شريك"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerForm;
