
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyLogoUploadProps {
  initialLogoUrl?: string;
  onLogoChange: (logoUrl: string | null) => void;
}

export default function CompanyLogoUpload({ initialLogoUrl, onLogoChange }: CompanyLogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    
    if (fileSize > 5) {
      toast({
        variant: "destructive",
        title: "الملف كبير جداً",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت"
      });
      return;
    }
    
    if (!file.type.includes('image')) {
      toast({
        variant: "destructive",
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF)"
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // بدلاً من رفع الصورة إلى Supabase، سنقوم بتحويلها إلى Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
        onLogoChange(base64String);
        setUploading(false);
        
        toast({
          title: "تم تحديث الشعار",
          description: "تم تحديث شعار الشركة بنجاح"
        });
      };
      
      reader.onerror = (error) => {
        console.error("Error converting image:", error);
        setUploading(false);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل الصورة",
          description: "حدث خطأ أثناء محاولة تحميل الصورة"
        });
      };
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الشعار",
        description: "حدث خطأ أثناء محاولة رفع شعار الشركة"
      });
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "تم إزالة الشعار",
      description: "تم إزالة شعار الشركة بنجاح"
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group"
      >
        {logoUrl ? (
          <>
            <img 
              src={logoUrl} 
              alt="شعار الشركة" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="destructive" 
                size="sm" 
                className="rounded-full p-2" 
                onClick={removeLogo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <ImageIcon className="h-12 w-12 text-gray-400" />
        )}
      </div>
      
      <div className="flex items-center space-x-2 space-x-reverse">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="logo-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "جاري الرفع..." : "تغيير الشعار"}
          <Upload className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
