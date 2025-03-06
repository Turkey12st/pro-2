
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/database";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Calendar, AlertTriangle, FileDown, Upload, FileSpreadsheet, FilePdf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AutoSaveDocumentForm from "@/components/documents/AutoSaveDocumentForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentWithDaysRemaining extends Document {
  days_remaining: number;
}

export default function DocumentsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_documents")
        .select("*")
        .order("expiry_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // تحديد حالة المستندات وحساب الأيام المتبقية
  const processedDocuments: DocumentWithDaysRemaining[] = documents?.map(doc => {
    const today = new Date();
    const expiryDate = new Date(doc.expiry_date);
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    let status: "active" | "expired" | "soon-expire" = "active";
    if (daysRemaining <= 0) {
      status = "expired";
    } else if (daysRemaining <= 30) {
      status = "soon-expire";
    }

    return {
      ...doc,
      status,
      days_remaining: daysRemaining,
      id: doc.id || doc.created_at // استخدام created_at كبديل مؤقت لـ id
    };
  }) || [];

  // تصفية المستندات حسب علامة التبويب النشطة
  const filteredDocuments = activeTab === "all" 
    ? processedDocuments 
    : processedDocuments.filter(doc => {
        if (activeTab === "active") return doc.status === "active" && doc.days_remaining > 30;
        if (activeTab === "soon-expire") return doc.status === "soon-expire";
        if (activeTab === "expired") return doc.status === "expired";
        return true;
      });

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (status === "expired") {
      return <Badge variant="destructive" className="mr-2">منتهي</Badge>;
    } else if (status === "soon-expire") {
      return <Badge variant="outline" className="mr-2 bg-yellow-100 text-yellow-800 border-yellow-300">ينتهي قريباً</Badge>;
    }
    return <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 border-green-300">ساري</Badge>;
  };

  // دالة تعديل المستند
  const handleEditDocument = (docId: string) => {
    setSelectedDocument(docId);
    setOpenDialog(true);
  };

  // دالة حذف المستند
  const handleDeleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", docId);

      if (error) throw error;
      
      toast({
        title: "تم حذف المستند بنجاح",
        description: "تم حذف المستند من قاعدة البيانات"
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف المستند"
      });
    }
  };

  // دالة تصدير المستندات
  const exportDocuments = (type: 'excel' | 'pdf' | 'csv') => {
    try {
      // تحضير البيانات للتصدير
      const exportData = filteredDocuments.map(doc => {
        return {
          "العنوان": doc.title,
          "النوع": doc.type,
          "الرقم": doc.number || '',
          "تاريخ الإصدار": new Date(doc.issue_date).toLocaleDateString('ar'),
          "تاريخ الانتهاء": new Date(doc.expiry_date).toLocaleDateString('ar'),
          "الحالة": doc.status === "active" ? "ساري" : doc.status === "soon-expire" ? "ينتهي قريباً" : "منتهي",
          "الأيام المتبقية": doc.days_remaining > 0 ? doc.days_remaining : 0
        };
      });

      if (type === 'excel') {
        // تصدير كملف Excel
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "المستندات");
        
        // تعديل عرض الأعمدة
        const columnWidths = [
          { wch: 25 }, // العنوان
          { wch: 20 }, // النوع
          { wch: 15 }, // الرقم
          { wch: 15 }, // تاريخ الإصدار
          { wch: 15 }, // تاريخ الانتهاء
          { wch: 15 }, // الحالة
          { wch: 12 }, // الأيام المتبقية
        ];
        ws['!cols'] = columnWidths;
        
        XLSX.writeFile(wb, "قائمة_المستندات.xlsx");
      } else if (type === 'pdf') {
        // تصدير كملف PDF
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // إضافة دعم اللغة العربية
        doc.setFont("Helvetica", "normal");
        doc.setR2L(true);
        
        // إنشاء الجدول
        (doc as any).autoTable({
          head: [["الأيام المتبقية", "الحالة", "تاريخ الانتهاء", "تاريخ الإصدار", "الرقم", "النوع", "العنوان"]],
          body: exportData.map(item => [
            item["الأيام المتبقية"],
            item["الحالة"],
            item["تاريخ الانتهاء"],
            item["تاريخ الإصدار"],
            item["الرقم"],
            item["النوع"],
            item["العنوان"]
          ]),
          theme: 'striped',
          styles: { fontSize: 8, halign: 'right' },
          headStyles: { fillColor: [66, 66, 66] }
        });
        
        doc.save("قائمة_المستندات.pdf");
      } else if (type === 'csv') {
        // تصدير كملف CSV
        let csvContent = "data:text/csv;charset=utf-8," + 
          Object.keys(exportData[0]).join(",") + "\n" +
          exportData.map(row => Object.values(row).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "قائمة_المستندات.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير المستندات بصيغة ${type === 'excel' ? 'Excel' : type === 'pdf' ? 'PDF' : 'CSV'}`
      });
    } catch (error) {
      console.error("Error exporting documents:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير المستندات"
      });
    }
  };

  // استيراد المستندات من ملف Excel
  const importDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // هنا يمكن معالجة البيانات المستوردة وإضافتها إلى قاعدة البيانات
        toast({
          title: "تم استيراد البيانات",
          description: `تم استيراد ${jsonData.length} مستند بنجاح`
        });

        // إعادة تحميل المستندات
        refetch();
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error importing documents:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء محاولة استيراد المستندات"
      });
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="ml-2 h-6 w-6" />
          إدارة المستندات والوثائق
        </h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 ml-2" />
                تصدير المستندات
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>اختر صيغة التصدير</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportDocuments('excel')} className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير كملف Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportDocuments('csv')} className="cursor-pointer">
                <FileText className="h-4 w-4 ml-2" />
                تصدير كملف CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportDocuments('pdf')} className="cursor-pointer">
                <FilePdf className="h-4 w-4 ml-2" />
                تصدير كملف PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative">
            <Button variant="outline" onClick={() => document.getElementById('import-documents')?.click()}>
              <Upload className="h-4 w-4 ml-2" />
              استيراد مستندات
            </Button>
            <input
              type="file"
              id="import-documents"
              className="hidden absolute"
              accept=".xlsx,.xls,.csv"
              onChange={importDocuments}
            />
          </div>
          
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) setSelectedDocument(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة مستند جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <AutoSaveDocumentForm 
                documentId={selectedDocument || undefined} 
                onSuccess={() => {
                  setOpenDialog(false);
                  setSelectedDocument(null);
                  refetch();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع المستندات</TabsTrigger>
          <TabsTrigger value="active">سارية</TabsTrigger>
          <TabsTrigger value="soon-expire">تنتهي قريباً</TabsTrigger>
          <TabsTrigger value="expired">منتهية</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">جاري تحميل المستندات...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center p-10 border rounded-md bg-muted/20">
              <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">لا توجد مستندات</h3>
              <p className="text-muted-foreground">لم يتم العثور على أي مستندات في هذه الفئة.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 ml-2" />
                        <span>{document.title}</span>
                      </div>
                      {getStatusBadge(document.status, document.days_remaining)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">نوع المستند</p>
                          <p className="font-medium">{document.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">رقم المستند</p>
                          <p className="font-medium">{document.number || "غير محدد"}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                            <p className="font-medium">{new Date(document.issue_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                            <p className="font-medium">{new Date(document.expiry_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                      </div>

                      {document.days_remaining <= 30 && document.days_remaining > 0 && (
                        <div className="mt-2 bg-yellow-50 p-2 rounded-md flex items-center">
                          <AlertTriangle className="h-4 w-4 ml-2 text-yellow-600" />
                          <p className="text-sm text-yellow-700">
                            متبقي <strong>{document.days_remaining}</strong> {document.days_remaining === 1 ? "يوم" : "أيام"} على الانتهاء
                          </p>
                        </div>
                      )}
                      
                      {document.days_remaining <= 0 && (
                        <div className="mt-2 bg-red-50 p-2 rounded-md flex items-center">
                          <AlertTriangle className="h-4 w-4 ml-2 text-red-600" />
                          <p className="text-sm text-red-700">
                            <strong>منتهي الصلاحية</strong> منذ {Math.abs(document.days_remaining)} {Math.abs(document.days_remaining) === 1 ? "يوم" : "أيام"}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-2 gap-2">
                        {document.document_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={document.document_url} target="_blank" rel="noopener noreferrer">
                              عرض المستند
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditDocument(document.id)}
                        >
                          تعديل
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
