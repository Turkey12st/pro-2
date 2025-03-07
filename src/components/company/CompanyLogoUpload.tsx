
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type CompanyLogoUploadProps = {
  companyId: string;
  existingMetadata?: { [key: string]: any; logo_url?: string };
  onLogoUpdate?: (logoUrl: string) => void;
};

export default function CompanyLogoUpload({
  companyId,
  existingMetadata = {},
  onLogoUpdate,
}: CompanyLogoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // تحديث المعاينة إذا كان هناك شعار موجود
    if (existingMetadata && typeof existingMetadata === 'object' && 'logo_url' in existingMetadata) {
      setPreviewUrl(existingMetadata.logo_url || "");
    }
  }, [existingMetadata]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // إنشاء URL معاينة للصورة المختارة
      const fileURL = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileURL);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار صورة الشعار أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. تحميل الملف إلى Supabase Storage (تعليق: يجب تهيئة تخزين Supabase أولاً)
      // هذا مثال فقط، في التطبيق الفعلي يجب تكوين تخزين Supabase

      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // محاكاة تأخير التحميل
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // بدلاً من التحميل الفعلي، سنحدث فقط البيانات الوصفية للشركة
      const logoUrl = previewUrl; // في التنفيذ الحقيقي، هذا سيكون URL التخزين

      // 2. تحديث البيانات الوصفية للشركة مع رابط الشعار
      const updatedMetadata = {
        ...existingMetadata,
        logo_url: logoUrl,
      };

      const { error } = await supabase
        .from("company_Info")
        .update({ metadata: updatedMetadata })
        .eq("id", companyId);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setUploadProgress(100);
      setUploadSuccess(true);

      // إشعار المكون الأب بتحديث الشعار
      if (onLogoUpdate) {
        onLogoUpdate(logoUrl);
      }

      toast({
        title: "تم التحميل بنجاح",
        description: "تم تحديث شعار الشركة",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل الشعار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {previewUrl ? (
          <div className="relative mb-4">
            <img
              src={previewUrl}
              alt="Company Logo"
              className="h-32 w-32 object-contain rounded-md border"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl("");
                setFile(null);
                setUploadSuccess(false);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove logo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-32 w-32 flex items-center justify-center bg-gray-100 rounded-md border mb-4">
            <Upload className="h-10 w-10 text-gray-400" />
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center text-green-500 mb-2">
            <Check className="h-4 w-4 mr-1" />
            <span>تم تحميل الشعار بنجاح</span>
          </div>
        )}

        {isUploading && (
          <div className="w-full mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-center mt-1">{uploadProgress}%</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="logo">شعار الشركة</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "جاري التحميل..." : "تحميل الشعار"}
        </Button>
      </div>
    </div>
  );
}
