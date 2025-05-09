
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCompanyData } from "@/hooks/useCompanyData";

export function CompanyInfoCard() {
  const { companyInfo, loading } = useCompanyData();
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>معلومات الشركة</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs" 
            onClick={() => navigate("/company")}
          >
            تعديل
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="flex items-start space-x-4 space-x-reverse">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{companyInfo.company_name || "غير محدد"}</p>
                <p className="text-sm text-muted-foreground">
                  {companyInfo.company_type || "نوع الشركة غير محدد"}
                </p>
                {companyInfo.unified_national_number && (
                  <p className="text-sm text-muted-foreground">
                    الرقم الوطني الموحد: {companyInfo.unified_national_number}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {companyInfo.address && (
                  <address className="not-italic text-muted-foreground">
                    {companyInfo.address?.city && companyInfo.address?.city + ", "}
                    {companyInfo.address?.street}
                    {companyInfo.address?.postal_code && (
                      <span dir="ltr"> {companyInfo.address?.postal_code}</span>
                    )}
                  </address>
                )}
                {!companyInfo.address && <p className="text-muted-foreground">العنوان غير محدد</p>}
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {companyInfo.contact?.email ? (
                  <p className="text-muted-foreground" dir="ltr">{companyInfo.contact.email}</p>
                ) : (
                  <p className="text-muted-foreground">البريد الإلكتروني غير محدد</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {companyInfo.contact?.phone ? (
                  <p className="text-muted-foreground" dir="ltr">{companyInfo.contact.phone}</p>
                ) : (
                  <p className="text-muted-foreground">رقم الهاتف غير محدد</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
