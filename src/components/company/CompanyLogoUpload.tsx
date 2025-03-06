
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Check, X } from "lucide-react";

export default function CompanyLogoUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch company info
  const fetchCompanyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("company_Info")
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCompanyInfo(data);
        // Check if logo_url exists in metadata
        if (data.metadata && data.metadata.logo_url) {
          setCompanyLogo(data.metadata.logo_url);
        }
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  // Upload company logo
  const uploadLogo = async (file: File) => {
    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `company_logo_${Date.now()}.${fileExt}`;
      const filePath = `company/${fileName}`;
      
      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
        
      const logoUrl = urlData.publicUrl;
      
      // Update company info with logo URL
      if (companyInfo) {
        const updatedMetadata = {
          ...(companyInfo.metadata || {}),
          logo_url: logoUrl
        };
        
        const { error: updateError } = await supabase
          .from("company_Info")
          .update({
            metadata: updatedMetadata
          })
          .eq("id", companyInfo.id);
          
        if (updateError) {
          throw updateError;
        }
        
        // Update local state
        setCompanyLogo(logoUrl);
        
        toast({
          title: "تم رفع الشعار بنجاح",
          description: "تم تحديث شعار الشركة بنجاح"
        });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        variant: "destructive",
        title: "خطأ في رفع الشعار",
        description: "حدث خطأ أثناء محاولة رفع شعار الشركة"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      uploadLogo(file);
    }
  };

  // Handle logo removal
  const handleRemoveLogo = async () => {
    try {
      if (companyInfo) {
        const updatedMetadata = {
          ...(companyInfo.metadata || {})
        };
        
        // Remove logo_url from metadata
        delete updatedMetadata.logo_url;
        
        const { error } = await supabase
          .from("company_Info")
          .update({
            metadata: updatedMetadata
          })
          .eq("id", companyInfo.id);
          
        if (error) {
          throw error;
        }
        
        // Update local state
        setCompanyLogo(null);
        
        toast({
          title: "تم إزالة الشعار",
          description: "تم إزالة شعار الشركة بنجاح"
        });
      }
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إزالة الشعار",
        description: "حدث خطأ أثناء محاولة إزالة شعار الشركة"
      });
    }
  };

  // Effect to fetch company info on component mount
  React.useEffect(() => {
    fetchCompanyInfo();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">شعار الشركة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyLogo ? (
            <div className="space-y-4">
              <div className="border rounded-md p-4 flex justify-center">
                <img 
                  src={companyLogo} 
                  alt="شعار الشركة" 
                  className="max-h-40 max-w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  تغيير الشعار
                </Button>
                
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 ml-2" />
                  إزالة الشعار
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-md p-4 flex flex-col items-center justify-center h-40">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">قم برفع شعار الشركة</p>
              </div>
              
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 ml-2" />
                {uploading ? "جاري الرفع..." : "اختيار ملف"}
              </Button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <p className="text-xs text-muted-foreground">
            يفضل رفع صورة بصيغة PNG أو JPEG بحجم لا يزيد عن 2MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
