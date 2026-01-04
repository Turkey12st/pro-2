
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Upload, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  name: string;
  url: string;
  type: string;
}

interface EmployeeDocumentsProps {
  employeeId?: string;
  documents: Document[];
}

export function EmployeeDocuments({ employeeId, documents }: EmployeeDocumentsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!documentName) {
        setDocumentName(e.target.files[0].name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentType || !employeeId) {
      toast({
        title: "خطأ في الرفع",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Store file path instead of public URL for security
      const filePath = fileName;

      // Update employee record with new document
      const { data: employee, error: fetchError } = await supabase
        .from('employees')
        .select('documents')
        .eq('id', employeeId)
        .single();

      if (fetchError) throw fetchError;

      // Cast documents to the correct array type or provide a default empty array
      const existingDocuments = Array.isArray(employee.documents) ? employee.documents : [];
      
      const updatedDocuments = [
        ...existingDocuments,
        {
          name: documentName,
          url: filePath, // Store path, not URL
          type: documentType
        }
      ];

      const { error: updateError } = await supabase
        .from('employees')
        .update({ documents: updatedDocuments })
        .eq('id', employeeId);

      if (updateError) throw updateError;

      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم إضافة المستند إلى ملف الموظف",
      });

      setIsDialogOpen(false);
      setSelectedFile(null);
      setDocumentName("");
      setDocumentType("");
      
      // Refresh page to show new document
      window.location.reload();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "خطأ في رفع المستند",
        description: "حدث خطأ أثناء محاولة رفع المستند",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const viewDocument = async (url: string) => {
    try {
      // Generate signed URL for secure viewing
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(url, 3600); // 1 hour expiry

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Error getting signed URL:", error);
      toast({
        title: "خطأ في فتح المستند",
        description: "حدث خطأ أثناء محاولة فتح المستند",
        variant: "destructive",
      });
    }
  };

  const downloadDocument = async (url: string, name: string) => {
    try {
      // Generate signed URL for download
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(url, 3600);

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "خطأ في تنزيل المستند",
        description: "حدث خطأ أثناء محاولة تنزيل المستند",
        variant: "destructive",
      });
    }
  };

  const documentTypes = [
    "هوية وطنية",
    "جواز سفر",
    "إقامة",
    "رخصة قيادة",
    "عقد عمل",
    "شهادة دراسية",
    "شهادة خبرة",
    "تقرير طبي",
    "مستندات عائلية",
    "أخرى"
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>مستندات الموظف</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span>رفع مستند</span>
        </Button>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>اسم المستند</TableHead>
                <TableHead>نوع المستند</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewDocument(doc.url)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">عرض</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => downloadDocument(doc.url, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">تنزيل</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">لا توجد مستندات لهذا الموظف</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستند جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">اسم المستند</Label>
              <Input
                id="documentName"
                placeholder="ادخل اسم المستند"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">نوع المستند</Label>
              <select
                id="documentType"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">اختر نوع المستند</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">اختر الملف</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !documentName || !documentType || isUploading}
            >
              {isUploading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
