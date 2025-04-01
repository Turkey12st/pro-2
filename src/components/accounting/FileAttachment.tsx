
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip, X, FileIcon, FileText } from "lucide-react";
import { getFileType } from "@/utils/fileUploadHelpers";

interface FileAttachmentProps {
  attachment: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  allowedTypes?: string[];
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachment,
  onChange,
  label = "إضافة مرفق",
  allowedTypes
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      
      // التحقق من نوع الملف إذا تم تحديد أنواع مسموحة
      if (allowedTypes && allowedTypes.length > 0) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedTypes.includes(fileExtension)) {
          setError(`نوع الملف غير مسموح به. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
          return;
        }
      }
      
      onChange(file);
    }
  };

  const handleRemoveAttachment = () => {
    onChange(null);
    setError(null);
  };

  // تحديد أيقونة الملف بناءً على نوعه
  const getFileIcon = () => {
    if (!attachment) return <Paperclip className="h-4 w-4" />;
    
    const fileType = getFileType(attachment.name);
    
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="attachment">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept={allowedTypes?.map(type => `.${type}`).join(',')}
        />
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={() => document.getElementById('attachment')?.click()}
        >
          {getFileIcon()}
          {attachment ? attachment.name : "اختر ملفًا"}
        </Button>
        {attachment && (
          <Button 
            type="button" 
            variant="destructive" 
            size="sm"
            onClick={handleRemoveAttachment}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {attachment && (
        <p className="text-xs text-muted-foreground">
          {(attachment.size / 1024).toFixed(2)} كيلوبايت | {attachment.type || 'نوع غير معروف'}
        </p>
      )}
    </div>
  );
};

export default FileAttachment;
