import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, FileText, Eye, Pencil, Trash, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@/types/database";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company_documents")
        .select("*")
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      const processedDocs = data.map(doc => ({
        ...doc,
        id: doc.id || crypto.randomUUID(),
        status: doc.status as 'active' | 'expired' | 'soon-expire'
      })) as Document[];
      
      setDocuments(processedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات المستندات.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المستند؟")) {
      try {
        const { error } = await supabase
          .from("company_documents")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "تم حذف المستند",
          description: "تم حذف المستند بنجاح",
        });

        // تحديث قائمة المستندات
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          title: "خطأ في حذف المستند",
          description: "حدث خطأ أثناء محاولة حذف المستند",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "soon-expire":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "ساري";
      case "expired":
        return "منتهي";
      case "soon-expire":
        return "قرب الانتهاء";
      default:
        return "غير معروف";
    }
  };

  const calculateDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDocumentTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      commercial_registration: "السجل التجاري",
      tax_certificate: "شهادة الزكاة والضريبة",
      gosi_certificate: "شهادة التأمينات الاجتماعية",
      hrsd_certificate: "شهادة وزارة الموارد البشرية",
      municipality_license: "رخصة البلدية",
      civil_defense_license: "رخصة الدفاع المدني",
    };

    return typeMap[type] || type;
  };

  const filterDocumentsByStatus = (status: string) => {
    if (status === "all") return documents;
    return documents.filter(doc => doc.status === status);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المستندات</h1>
        <Button onClick={() => navigate("/documents/new")}>
          <Plus className="mr-2 h-4 w-4" /> إضافة مستند جديد
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع المستندات</TabsTrigger>
          <TabsTrigger value="active">سارية</TabsTrigger>
          <TabsTrigger value="soon-expire">قرب الانتهاء</TabsTrigger>
          <TabsTrigger value="expired">منتهية</TabsTrigger>
        </TabsList>

        {["all", "active", "soon-expire", "expired"].map(status => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">جاري تحميل البيانات...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filterDocumentsByStatus(status).length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا توجد مستندات للعرض</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterDocumentsByStatus(status).map(document => {
                  const daysRemaining = calculateDaysRemaining(document.expiry_date);
                  return (
                    <Card key={document.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            <span>{document.title}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(
                              document.status
                            )}`}
                          >
                            {getStatusText(document.status)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">النوع:</span>
                            <span>{getDocumentTypeText(document.type)}</span>
                          </div>
                          {document.number && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">الرقم:</span>
                              <span>{document.number}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">تاريخ الإصدار:</span>
                            <span>{format(new Date(document.issue_date), "yyyy/MM/dd")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                            <span>{format(new Date(document.expiry_date), "yyyy/MM/dd")}</span>
                          </div>
                          {daysRemaining > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">المتبقي:</span>
                              <span
                                className={
                                  daysRemaining <= 7
                                    ? "text-red-600 font-semibold"
                                    : daysRemaining <= 30
                                    ? "text-yellow-600 font-semibold"
                                    : ""
                                }
                              >
                                {daysRemaining} يوم
                                {daysRemaining <= 7 && <AlertCircle className="inline ml-1 h-4 w-4" />}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2">
                            <div className="space-x-1 rtl:space-x-reverse">
                              {document.document_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={document.document_url} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-1" /> عرض
                                  </a>
                                </Button>
                              )}
                            </div>
                            <div className="space-x-1 rtl:space-x-reverse">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/documents/edit/${document.id}`)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> تعديل
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleDeleteDocument(document.id)}
                              >
                                <Trash className="h-4 w-4 mr-1" /> حذف
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DocumentsPage;
