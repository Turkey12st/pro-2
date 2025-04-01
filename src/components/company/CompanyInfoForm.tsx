
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import CompanyLogoUpload from "./CompanyLogoUpload";
import { useCompanyForm } from "@/hooks/useCompanyForm";
import { BasicInfoFields } from "./BasicInfoFields";
import { RegistrationFields } from "./RegistrationFields";
import { ActivityFields } from "./ActivityFields";
import { BankingFields } from "./BankingFields";
import { AddressFields } from "./AddressFields";

export function CompanyInfoForm() {
  const {
    formData,
    loading,
    saving,
    autoSaveLoading,
    lastSaved,
    handleInputChange,
    handleSelectChange,
    handleLogoChange,
    handleSubmit
  } = useCompanyForm();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>معلومات الشركة</span>
          {lastSaved && (
            <span className="text-sm font-normal text-muted-foreground">
              {autoSaveLoading ? 'جاري الحفظ...' : `آخر حفظ: ${lastSaved}`}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="md:col-span-2">
            <CompanyLogoUpload 
              initialLogoUrl={(formData?.metadata as any)?.logo_url} 
              onLogoChange={handleLogoChange}
            />
          </div>
          
          <BasicInfoFields 
            formData={formData} 
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
          />
          
          <RegistrationFields 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <ActivityFields 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <BankingFields 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <AddressFields 
            formData={formData} 
            handleInputChange={handleInputChange}
          />
          
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            حفظ معلومات الشركة
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CompanyInfoForm;
