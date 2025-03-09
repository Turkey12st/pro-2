
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "@/types/database";

interface PartnerFormProps {
  onSuccess?: () => void;
}

interface PartnerData {
  name: string;
  nationality?: string;
  identity_number?: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  position?: string;
  contact_info: {
    email?: string;
    phone?: string;
  };
}

const PartnerForm: React.FC<PartnerFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [partnerData, setPartnerData] = useState<PartnerData>({
    name: '',
    nationality: '',
    identity_number: '',
    partner_type: 'individual',
    ownership_percentage: 0,
    share_value: 0,
    position: '',
    contact_info: {
      email: '',
      phone: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setPartnerData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          email: value
        }
      }));
    } else if (name === 'phone') {
      setPartnerData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          phone: value
        }
      }));
    } else if (name === 'ownership_percentage' || name === 'share_value') {
      setPartnerData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setPartnerData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePartnerTypeChange = (value: string) => {
    setPartnerData(prev => ({
      ...prev,
      partner_type: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Insert into company_partners table
      const { error } = await supabase
        .from('company_partners')
        .insert([{
          name: partnerData.name,
          nationality: partnerData.nationality,
          identity_number: partnerData.identity_number,
          partner_type: partnerData.partner_type,
          ownership_percentage: partnerData.ownership_percentage,
          share_value: partnerData.share_value,
          position: partnerData.position,
          contact_info: partnerData.contact_info,
          documents: []
        }]);
      
      if (error) throw error;
      
      toast({
        title: "تم إضافة الشريك بنجاح",
        description: `تم إضافة ${partnerData.name} إلى قائمة الشركاء بنجاح.`,
      });
      
      // Reset form
      setPartnerData({
        name: '',
        nationality: '',
        identity_number: '',
        partner_type: 'individual',
        ownership_percentage: 0,
        share_value: 0,
        position: '',
        contact_info: {
          email: '',
          phone: '',
        },
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error adding partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إضافة الشريك",
        description: "حدث خطأ أثناء محاولة إضافة الشريك. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
          </div>
          
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
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "إضافة شريك"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerForm;
