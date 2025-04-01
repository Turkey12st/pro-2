
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip, X } from "lucide-react";

interface FileAttachmentProps {
  attachment: File | null;
  onChange: (file: File | null) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachment,
  onChange
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemoveAttachment = () => {
    onChange(null);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="attachment">إضافة مرفق</Label>
      <div className="flex items-center gap-2">
        <Input
          id="attachment"
          name="attachment"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={() => document.getElementById('attachment')?.click()}
        >
          <Paperclip className="h-4 w-4" />
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
    </div>
  );
};

export default FileAttachment;
