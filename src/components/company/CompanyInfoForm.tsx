import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CompanyInfo, Address } from "@/types/database";

interface CompanyInfoFormProps {
  initialData?: CompanyInfo | null;
  onSuccess: () => void;
}

export function CompanyInfoForm({ initialData, onSuccess }: CompanyInfoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultAddress: Address = {
    street: "",
    city: "",
    postal_code: "",
  };
  
  const [formData, setFormData] = useState<Partial<CompanyInfo>>(() => {
    if (initialData) {
      let addressObj: Address = defaultAddress;
      if (initialData.address) {
        if (typeof initialData.address === 'string') {
          try {
            addressObj = JSON.parse(initialData.address);
          } catch (e) {
            console.error("Could not parse address string:", e);
          }
        } else {
          addressObj = initialData.address as Address;
        }
      }
      
      return {
        ...initialData,
        address: addressObj
      };
    }
    
    return {
      company_name: "",
      company_type: "",
      establishment_date: "",
      commercial_registration: "",
      unified_national_number: "",
      social_insurance_number: "",
      hrsd_number: "",
      bank_name: "",
      bank_iban: "",
      nitaqat_activity: "",
      economic_activity: "",
      tax_number: "",
      license_expiry_date: "",
      address: defaultAddress,
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown> || {}),
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.company_name || !formData.company_type || 
          !formData.establishment_date || !formData.commercial_registration || 
          !formData.unified_national_number) {
        throw new Error("يرجى ملء جميع الحقول المطلوبة");
      }

      const unifiedNationalNumber = typeof formData.unified_national_number === 'string' 
        ? parseFloat(formData.unified_national_number) 
        : formData.unified_national_number;

      const addressForDB = typeof formData.address === 'string' 
        ? formData.address 
        : JSON.stringify(formData.address);

      const companyData = {
        company_name: formData.company_name,
        company_type: formData.company_type,
        establishment_date: formData.establishment_date,
        commercial_registration: formData.commercial_registration,
        "Unified National Number": unifiedNationalNumber,
        social_insurance_number: formData.social_insurance_number,
        hrsd_number: formData.hrsd_number,
        bank_name: formData.bank_name,
        bank_iban: formData.bank_iban,
        nitaqat_activity: formData.nitaqat_activity,
        economic_activity: formData.economic_activity,
        tax_number: formData.tax_number,
        license_expiry_date: formData.license_expiry_date,
        address: addressForDB,
      };

      let result;
      
      if (initialData?.id) {
        result = await supabase
          .from("company_Info")
          .update(companyData)
          .eq("id", initialData.id);
      } else {
        result = await supabase
          .from("company_Info")
          .insert([companyData]);
      }

      if (result.error) throw result.error;

      toast({
        title: initialData ? "تم تحديث المعلومات بنجاح" : "تم إضافة المعلومات بنجاح",
        description: "تم حفظ بيانات الشركة في قاعدة البيانات",
      });

      onSuccess();
    } catch (error) {
      console.error("خطأ في حفظ بيانات الشركة:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات الشركة",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddressValue = (field: keyof Address): string => {
    if (!formData.address) return '';
    
    const address = formData.address as Address;
    return address[field]?.toString() || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
          <TabsTrigger value="government">البيانات الحكومية</TabsTrigger>
          <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  اسم الشركة <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_type">
                  نوع الشركة <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_type"
                  name="company_type"
                  value={formData.company_type || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial_registration">
                  رقم السجل التجاري <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="commercial_registration"
                  name="commercial_registration"
                  value={formData.commercial_registration || ""}
                  onChange={handleChange}
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishment_date">
                  تاريخ التأسيس <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="establishment_date"
                  name="establishment_date"
                  type="date"
                  value={formData.establishment_date || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license_expiry_date">تاريخ انتهاء الترخيص</Label>
                <Input
                  id="license_expiry_date"
                  name="license_expiry_date"
                  type="date"
                  value={formData.license_expiry_date || ""}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="government" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unified_national_number">
                  الرقم الوطني الموحد <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unified_national_number"
                  name="unified_national_number"
                  value={formData.unified_national_number || ""}
                  onChange={handleChange}
                  required
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_insurance_number">رقم التأمينات الاجتماعية</Label>
                <Input
                  id="social_insurance_number"
                  name="social_insurance_number"
                  value={formData.social_insurance_number || ""}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hrsd_number">رقم وزارة الموارد البشرية</Label>
                <Input
                  id="hrsd_number"
                  name="hrsd_number"
                  value={formData.hrsd_number || ""}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nitaqat_activity">نشاط نطاقات</Label>
                <Input
                  id="nitaqat_activity"
                  name="nitaqat_activity"
                  value={formData.nitaqat_activity || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="economic_activity">النشاط الاقتصادي</Label>
                <Input
                  id="economic_activity"
                  name="economic_activity"
                  value={formData.economic_activity || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax_number">الرقم الضريبي</Label>
                <Input
                  id="tax_number"
                  name="tax_number"
                  value={formData.tax_number || ""}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">اسم البنك</Label>
                <Input
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bank_iban">رقم الآيبان</Label>
                <Input
                  id="bank_iban"
                  name="bank_iban"
                  value={formData.bank_iban || ""}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.street">الشارع</Label>
                <Input
                  id="address.street"
                  name="address.street"
                  value={getAddressValue('street')}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.city">المدينة</Label>
                <Input
                  id="address.city"
                  name="address.city"
                  value={getAddressValue('city')}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.postal_code">الرمز البريدي</Label>
                <Input
                  id="address.postal_code"
                  name="address.postal_code"
                  value={getAddressValue('postal_code')}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : (initialData ? "تحديث المعلومات" : "إضافة معلومات الشركة")}
        </Button>
      </div>
    </form>
  );
}
