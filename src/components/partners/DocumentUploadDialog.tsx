
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "./upload/FileUpload";
import { DocumentUploadDialogProps } from "./upload/types";
import { useDocumentUpload } from "./upload/useDocumentUpload";

export function DocumentUploadDialog({
  open,
  onOpenChange,
  partnerId,
  onSuccess,
}: DocumentUploadDialogProps) {
  const {
    loading,
    documentName,
    setDocumentName,
    file,
    handleFileChange,
    handleUpload
  } = useDocumentUpload(partnerId, onSuccess);

  const handleSubmit = async () => {
    const success = await handleUpload();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفع مستند جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="documentName" className="text-sm font-medium">
              اسم المستند
            </label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="أدخل اسم المستند"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="file" className="text-sm font-medium">
              الملف
            </label>
            <FileUpload
              onChange={handleFileChange}
              value={file}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !file}>
              {loading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadDialog;
