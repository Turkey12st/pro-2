
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Camera, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadCompanyLogo } from "@/utils/fileHelpers";
import Image from 'next/image';

interface CompanyLogoUploadProps {
  currentLogo?: string;
  onLogoChange?: (logoUrl: string) => void;
}

export default function CompanyLogoUpload({ currentLogo, onLogoChange }: CompanyLogoUploadProps) {
  const [logo, setLogo] = useState<string | undefined>(currentLogo);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة JPEG, PNG, GIF أو SVG"
      });
      return;
    }

    // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "حجم الملف كبير جداً",
        description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // معاينة الصورة قبل الرفع
      const objectUrl = URL.createObjectURL(file);
      setLogo(objectUrl);
      
      // رفع الصورة إلى Supabase
      const logoUrl = await uploadCompanyLogo(file);
      
      // تحديث الشعار في قاعدة البيانات
      const { error } = await supabase
        .from('company_Info')
        .update({ logo_url: logoUrl })
        .eq('id', 1); // افتراض أن معرف الشركة هو 1
      
      if (error) throw error;
      
      // تحديث حالة الشعار
      setLogo(logoUrl);
      
      // استدعاء دالة إرجاع النتيجة
      if (onLogoChange) onLogoChange(logoUrl);
      
      toast({
        title: "تم رفع الشعار بنجاح",
        description: "تم تحديث شعار الشركة بنجاح"
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الشعار",
        description: "حدث خطأ أثناء محاولة رفع شعار الشركة"
      });
      
      // استعادة الشعار السابق
      setLogo(currentLogo);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // إعادة تعيين حقل الإدخال
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeLogo = async () => {
    try {
      // حذف الشعار من قاعدة البيانات
      const { error } = await supabase
        .from('company_Info')
        .update({ logo_url: null })
        .eq('id', 1); // افتراض أن معرف الشركة هو 1
      
      if (error) throw error;
      
      // إعادة تعيين حالة الشعار
      setLogo(undefined);
      
      // استدعاء دالة إرجاع النتيجة
      if (onLogoChange) onLogoChange('');
      
      toast({
        title: "تم حذف الشعار",
        description: "تم حذف شعار الشركة بنجاح"
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف الشعار",
        description: "حدث خطأ أثناء محاولة حذف شعار الشركة"
      });
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {logo ? (
            <div className="relative w-32 h-32 mb-4">
              <img
                src={logo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full h-8 w-8"
                onClick={removeLogo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-lg font-medium mb-1">شعار الشركة</h3>
            <p className="text-sm text-muted-foreground mb-4">
              قم بتحميل شعار الشركة بصيغة PNG أو JPEG أو SVG
            </p>
            
            <div className="flex gap-2 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <span className="ml-2">{uploadProgress}%</span>
                    <svg
                      className="animate-spin h-4 w-4 ml-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 ml-2" />
                    {logo ? "تغيير الشعار" : "رفع شعار"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
