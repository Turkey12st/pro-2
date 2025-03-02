
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/database";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentForm from "@/components/documents/DocumentForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface DocumentWithDaysRemaining extends Document {
  days_remaining: number;
}

export default function DocumentsPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
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
      id: doc.created_at // استخدام created_at كبديل مؤقت لـ id
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
      return <Badge variant="destructive" className="ml-2">منتهي</Badge>;
    } else if (status === "soon-expire") {
      return <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">ينتهي قريباً</Badge>;
    }
    return <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">ساري</Badge>;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-6 w-6" />
          إدارة المستندات والوثائق
        </h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 ml-2" />
              إضافة مستند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DocumentForm onSuccess={() => {
              setOpenDialog(false);
              refetch();
            }} />
          </DialogContent>
        </Dialog>
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
                        <FileText className="h-5 w-5 mr-2" />
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
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                            <p className="font-medium">{new Date(document.issue_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                            <p className="font-medium">{new Date(document.expiry_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                      </div>

                      {document.days_remaining <= 30 && document.days_remaining > 0 && (
                        <div className="mt-2 bg-yellow-50 p-2 rounded-md flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                          <p className="text-sm text-yellow-700">
                            متبقي <strong>{document.days_remaining}</strong> {document.days_remaining === 1 ? "يوم" : "أيام"} على الانتهاء
                          </p>
                        </div>
                      )}
                      
                      {document.days_remaining <= 0 && (
                        <div className="mt-2 bg-red-50 p-2 rounded-md flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                          <p className="text-sm text-red-700">
                            <strong>منتهي الصلاحية</strong> منذ {Math.abs(document.days_remaining)} {Math.abs(document.days_remaining) === 1 ? "يوم" : "أيام"}
                          </p>
                        </div>
                      )}
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
