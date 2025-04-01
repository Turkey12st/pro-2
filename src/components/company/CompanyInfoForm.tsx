import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyInfo } from "@/types/database";
import { Save, Loader2 } from "lucide-react";
import CompanyLogoUpload from "./CompanyLogoUpload";
import useAutoSave from "@/hooks/useAutoSave";

export function CompanyInfoForm() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const { formData, setFormData, isLoading: autoSaveLoading, lastSaved } = useAutoSave<CompanyInfo>({
    formType: 'company_info',
    initialData: companyInfo,
    debounceMs: 2000
  });

  // جلب معلومات الشركة
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('company_Info')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          // تحويل البيانات إلى الشكل المطلوب
          const formattedData: CompanyInfo = {
            id: data.id,
            company_name: data.company_name || '',
            company_type: data.company_type || '',
            establishment_date: data.establishment_date || '',
            commercial_registration: data.commercial_registration || '',
            unified_national_number: data["Unified National Number"]?.toString() || '',
            social_insurance_number: data.social_insurance_number || '',
            hrsd_number: data.hrsd_number || '',
            bank_name: data.bank_name || '',
            bank_iban: data.bank_iban || '',
            nitaqat_activity: data.nitaqat_activity || '',
            economic_activity: data.economic_activity || '',
            tax_number: data.tax_number || '',
            address: typeof data.address === 'object' ? data.address as Record<string, any> : { street: '', city: '', postal_code: '' },
            metadata: data.metadata as Record<string, any> || {},
            license_expiry_date: data.license_expiry_date || '',
            created_at: data.created_at
          };
          
          setCompanyInfo(formattedData);
          setFormData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب بيانات الشركة",
          description: "حدث خطأ أثناء محاولة جلب بيانات الشركة"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyInfo();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...(prev.address as Record<string, any>),
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const formDataToSave = {
        ...formData,
        "Unified National Number": formData.unified_national_number ? parseInt(formData.unified_national_number) : null
      };
      
      delete formDataToSave.unified_national_number;
      
      let result;
      
      if (companyInfo?.id) {
        // تحديث السجل الموجود
        result = await supabase
          .from('company_Info')
          .update(formDataToSave)
          .eq('id', companyInfo.id);
      } else {
        // إنشاء سجل جديد
        result = await supabase
          .from('company_Info')
          .insert([formDataToSave]);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ معلومات الشركة بنجاح"
      });
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء محاولة حفظ معلومات الشركة"
      });
    } finally {
      setSaving(false);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <CompanyLogoUpload 
                initialLogoUrl={(formData?.metadata as any)?.logo_url} 
                onLogoChange={(logoUrl) => {
                  setFormData(prev => ({
                    ...prev,
                    metadata: {
                      ...((prev.metadata as any) || {}),
                      logo_url: logoUrl
                    }
                  }));
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">اسم الشركة</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData?.company_name || ''}
                onChange={handleInputChange}
                placeholder="أدخل اسم الشركة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_type">نوع الشركة</Label>
              <Select
                value={formData?.company_type || ''}
                onValueChange={(value) => handleSelectChange('company_type', value)}
              >
                <SelectTrigger id="company_type">
                  <SelectValue placeholder="اختر نوع الشركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مساهمة">شركة مساهمة</SelectItem>
                  <SelectItem value="ذات مسؤولية محدودة">ذات مسؤولية محدودة</SelectItem>
                  <SelectItem value="تضامنية">شركة تضامنية</SelectItem>
                  <SelectItem value="توصية بسيطة">شركة توصية بسيطة</SelectItem>
                  <SelectItem value="مهنية">شركة مهنية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commercial_registration">رقم السجل التجاري</Label>
              <Input
                id="commercial_registration"
                name="commercial_registration"
                value={formData?.commercial_registration || ''}
                onChange={handleInputChange}
                placeholder="أدخل رقم السجل التجاري"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="establishment_date">تاريخ التأسيس</Label>
              <Input
                id="establishment_date"
                name="establishment_date"
                value={formData?.establishment_date || ''}
                onChange={handleInputChange}
                placeholder="مثال: ١٤٤٢/٠٧/١٥"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unified_national_number">الرقم الموحد</Label>
              <Input
                id="unified_national_number"
                name="unified_national_number"
                value={formData?.unified_national_number || ''}
                onChange={handleInputChange}
                placeholder="أدخل الرقم الموحد"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="social_insurance_number">رقم التأمينات الاجتماعية</Label>
              <Input
                id="social_insurance_number"
                name="social_insurance_number"
                value={formData?.social_insurance_number || ''}
                onChange={handleInputChange}
                placeholder="أدخل رقم التأمينات الاجتماعية"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hrsd_number">رقم وزارة الموارد البشرية</Label>
              <Input
                id="hrsd_number"
                name="hrsd_number"
                value={formData?.hrsd_number || ''}
                onChange={handleInputChange}
                placeholder="أدخل رقم وزارة الموارد البشرية"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_number">الرقم الضريبي</Label>
              <Input
                id="tax_number"
                name="tax_number"
                value={formData?.tax_number || ''}
                onChange={handleInputChange}
                placeholder="أدخل الرقم الضريبي"
                dir="ltr"
              />
            </div>
            
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
