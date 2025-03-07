
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { FilePlus, Calendar, FileText, Download, Upload, AlertTriangle, Check, Timer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutoSaveDocumentForm } from "@/components/documents/AutoSaveDocumentForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import { Document, DocumentWithDaysRemaining } from "@/types/database";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DocumentsPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentWithDaysRemaining[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithDaysRemaining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, activeTab, searchTerm]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_documents")
        .select("*");

      if (error) throw error;

      // Add days_remaining to each document
      const docsWithDaysRemaining = (data || []).map((doc: any): DocumentWithDaysRemaining => {
        const today = new Date();
        const expiryDate = new Date(doc.expiry_date);
        const daysRemaining = differenceInDays(expiryDate, today);
        
        let status: "active" | "expired" | "soon-expire" = "active";
        if (daysRemaining < 0) {
          status = "expired";
        } else if (daysRemaining <= 30) {
          status = "soon-expire";
        }
        
        return {
          ...doc,
          id: doc.id || doc.created_at, // Use created_at as fallback ID
          status,
          days_remaining: daysRemaining
        } as DocumentWithDaysRemaining;
      });

      setDocuments(docsWithDaysRemaining);
      setFilteredDocuments(docsWithDaysRemaining);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات المستندات",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];
    
    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(doc => doc.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.number && doc.number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredDocuments(filtered);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", documentId);
      
      if (error) throw error;
      
      toast({
        title: "تم حذف المستند",
        description: "تم حذف المستند بنجاح"
      });
      
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "خطأ في حذف المستند",
        description: "حدث خطأ أثناء محاولة حذف المستند",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    try {
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.xlsx';
      
      const preparedData = filteredDocuments.map(doc => ({
        "عنوان المستند": doc.title,
        "نوع المستند": doc.type,
        "رقم المستند": doc.number || "",
        "تاريخ الإصدار": doc.issue_date,
        "تاريخ الانتهاء": doc.expiry_date,
        "الحالة": doc.status === "active" ? "ساري" : 
                doc.status === "soon-expire" ? "قريب من الانتهاء" : "منتهي",
        "الأيام المتبقية": doc.days_remaining
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(preparedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المستندات");
      
      // Set column widths
      const colWidths = [
        { wch: 25 }, // عنوان المستند
        { wch: 20 }, // نوع المستند
        { wch: 15 }, // رقم المستند
        { wch: 15 }, // تاريخ الإصدار
        { wch: 15 }, // تاريخ الانتهاء
        { wch: 15 }, // الحالة
        { wch: 15 }  // الأيام المتبقية
      ];
      worksheet['!cols'] = colWidths;
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      saveAs(data, `قائمة_المستندات${fileExtension}`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير بيانات المستندات إلى ملف إكسل.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء محاولة تصدير البيانات.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">إدارة المستندات</h1>
            <p className="text-muted-foreground">
              إدارة مستندات الشركة، تواريخ الانتهاء، والتنبيهات
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 flex-1 sm:flex-none">
                  <FilePlus className="h-4 w-4" />
                  إضافة مستند
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة مستند جديد</DialogTitle>
                  <DialogDescription>
                    قم بإدخال معلومات المستند الجديد
                  </DialogDescription>
                </DialogHeader>
                <AutoSaveDocumentForm onSuccess={fetchDocuments} />
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 flex-1 sm:flex-none"
              onClick={exportToExcel}
            >
              <FileText className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث في المستندات..." 
              className="pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            defaultValue="all"
            onValueChange={(value) => setActiveTab(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="جميع المستندات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستندات</SelectItem>
              <SelectItem value="active">سارية</SelectItem>
              <SelectItem value="soon-expire">قريبة من الانتهاء</SelectItem>
              <SelectItem value="expired">منتهية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">جميع المستندات</TabsTrigger>
            <TabsTrigger value="active">سارية</TabsTrigger>
            <TabsTrigger value="soon-expire">قريبة من الانتهاء</TabsTrigger>
            <TabsTrigger value="expired">منتهية</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderDocumentList(filteredDocuments)}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {renderDocumentList(filteredDocuments)}
          </TabsContent>
          
          <TabsContent value="soon-expire" className="space-y-4">
            {renderDocumentList(filteredDocuments)}
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4">
            {renderDocumentList(filteredDocuments)}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );

  function renderDocumentList(documents: DocumentWithDaysRemaining[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full inline-block mb-2"></div>
            <p className="text-muted-foreground">جاري تحميل المستندات...</p>
          </div>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">لا توجد مستندات متاحة</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className={`
            ${doc.status === "expired" ? "border-red-200 bg-red-50" : ""} 
            ${doc.status === "soon-expire" ? "border-amber-200 bg-amber-50" : ""}
          `}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg font-medium">{doc.title}</CardTitle>
                <StatusBadge status={doc.status} />
              </div>
              <p className="text-sm text-muted-foreground">{doc.type}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الإصدار</p>
                  <p className="text-sm font-medium">{formatDate(doc.issue_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الانتهاء</p>
                  <p className="text-sm font-medium">{formatDate(doc.expiry_date)}</p>
                </div>
                {doc.number && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">رقم المستند</p>
                    <p className="text-sm font-medium">{doc.number}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">الأيام المتبقية</p>
                  <p className={`text-sm font-medium ${
                    doc.days_remaining < 0 ? "text-red-600" : 
                    doc.days_remaining <= 30 ? "text-amber-600" : ""
                  }`}>
                    {doc.days_remaining < 0 
                      ? `منتهي منذ ${Math.abs(doc.days_remaining)} يوم` 
                      : `${doc.days_remaining} يوم`}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      تعديل
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تعديل المستند</DialogTitle>
                    </DialogHeader>
                    <AutoSaveDocumentForm initialData={doc} onSuccess={fetchDocuments} />
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function StatusBadge({ status }: { status: string }) {
    switch (status) {
      case "active":
        return <Badge variant="success" className="flex gap-1 items-center"><Check className="h-3 w-3" /> ساري</Badge>;
      case "soon-expire":
        return <Badge variant="warning" className="flex gap-1 items-center"><Timer className="h-3 w-3" /> قريب من الانتهاء</Badge>;
      case "expired":
        return <Badge variant="destructive" className="flex gap-1 items-center"><AlertTriangle className="h-3 w-3" /> منتهي</Badge>;
      default:
        return null;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA').format(date);
  }
}
