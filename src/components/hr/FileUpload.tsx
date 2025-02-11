
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FileUploadProps = {
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FileUpload({
  onPhotoChange,
  onDocumentsChange,
}: FileUploadProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>الصورة الشخصية</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
        />
      </div>
      <div className="space-y-2">
        <Label>المستندات</Label>
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={onDocumentsChange}
        />
      </div>
    </div>
  );
}
