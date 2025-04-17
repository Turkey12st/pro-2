
import { Input } from "@/components/ui/input";

export interface FileUploadProps {
  value: File | null;
  accept?: string;
  onChange: (file: File | null) => void;
}

export function FileUpload({ value, accept, onChange }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <Input
      type="file"
      onChange={handleChange}
      accept={accept || "*"}
    />
  );
}
