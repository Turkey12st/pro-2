
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, FileText, Paperclip, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface JournalEntryAttachmentProps {
  entryId?: string;
  onSuccess?: (fileUrl: string) => void;
  attachment?: File | null;
  onChange?: (file: File | null) => void;
  existingUrl?: string;
  onDelete?: () => void;
  isSaving?: boolean;
}

export const JournalEntryAttachment: React.FC<JournalEntryAttachmentProps> = ({
  entryId,
  onSuccess,
  attachment,
  onChange,
  existingUrl,
  onDelete
}) => {
  const [file, setFile] = useState<File | null>(attachment || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // التحقق من حجم الملف (الحد الأقصى 10 ميجابايت)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("حجم الملف يجب أن يكون أقل من 10 ميجابايت");
        return;
      }
      
      setFile(selectedFile);
      if (onChange) {
        onChange(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (onChange) {
      onChange(null);
    }
    setError(null);
  };

  const uploadToSupabase = async () => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${entryId || Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `journal-entries/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("حدث خطأ أثناء رفع الملف");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const fileUrl = await uploadToSupabase();
    
    if (fileUrl && onSuccess) {
      onSuccess(fileUrl);
      toast({
        title: "تم رفع المرفق",
        description: "تم رفع المرفق بنجاح",
      });
    } else if (!fileUrl) {
      toast({
        variant: "destructive",
        title: "خطأ في رفع المرفق",
        description: "حدث خطأ أثناء محاولة رفع المرفق",
      });
    }
  };

  // تحديد أيقونة الملف بناءً على نوعه
  const getFileIcon = () => {
    if (!file && !existingUrl) return <Paperclip className="h-4 w-4" />;
    
    const fileName = file ? file.name : existingUrl || "";
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(fileExt || '')) {
      return <FileText className="h-4 w-4" />;
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExt || '')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <FileIcon className="h-4 w-4" />;
    }
  };

  const getFileName = () => {
    if (file) return file.name;
    if (existingUrl) {
      // Extract file name from URL
      const urlParts = existingUrl.split('/');
      return urlParts[urlParts.length - 1];
    }
    return "اختر ملفًا";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="journal-attachment">المرفقات</Label>
      <div className="flex items-center gap-2">
        <Input
          id="journal-attachment"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* Display existing or selected file */}
        <div className="flex-1 flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={() => document.getElementById('journal-attachment')?.click()}
            disabled={isUploading}
          >
            {getFileIcon()}
            {getFileName()}
          </Button>
          
          {/* Show remove button when there's a file */}
          {(file || existingUrl) && (
            <Button 
              type="button" 
              variant="destructive" 
              size="icon"
              onClick={file ? handleRemoveFile : onDelete}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Upload button - only show for new files when needed */}
        {file && !existingUrl && (
          <Button 
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {file && (
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(2)} كيلوبايت | {file.type || 'نوع غير معروف'}
        </p>
      )}
    </div>
  );
};

export default JournalEntryAttachment;
