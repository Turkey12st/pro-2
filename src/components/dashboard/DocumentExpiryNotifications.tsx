
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DocumentWithDaysRemaining } from "@/types/database";
import { formatDate } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

export function DocumentExpiryNotifications() {
  const [expiringDocuments, setExpiringDocuments] = useState<DocumentWithDaysRemaining[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpiringDocuments = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const { data, error } = await supabase
          .from("company_documents")
          .select("*")
          .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
          .gte("expiry_date", today.toISOString().split("T")[0])
          .order("expiry_date", { ascending: true });

        if (error) {
          console.error("Error fetching documents:", error);
          return;
        }

        // حساب الأيام المتبقية لانتهاء كل مستند
        const documentsWithDaysRemaining = data.map((document) => {
          const expiryDate = new Date(document.expiry_date);
          const timeDifference = expiryDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
          
          // التأكد من وجود معرف للمستند
          const docId = document.id || crypto.randomUUID();

          return {
            ...document,
            days_remaining: daysRemaining,
            id: docId,
            status: document.status as 'active' | 'expired' | 'soon-expire'
          } as DocumentWithDaysRemaining;
        });

        setExpiringDocuments(documentsWithDaysRemaining);
      } catch (error) {
        console.error("Error processing documents data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringDocuments();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            المستندات التي توشك على الانتهاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex items-center justify-center">
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            المستندات التي توشك على الانتهاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد مستندات توشك على الانتهاء خلال الـ 30 يوم القادمة.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          المستندات التي توشك على الانتهاء
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => navigate("/documents")}>
          <FileText className="h-4 w-4 mr-2" /> إدارة المستندات
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiringDocuments.map((document) => (
          <Alert key={document.id} variant={document.days_remaining <= 7 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>{document.title}</span>
              {document.days_remaining <= 7 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">عاجل</span>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                  <span className="font-medium">{formatDate(document.expiry_date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">المتبقي:</span>
                  <span className={`font-semibold ${document.days_remaining <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                    {document.days_remaining} {document.days_remaining === 1 ? "يوم" : "أيام"}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => navigate(`/documents/edit/${document.id}`)}>
                  <Calendar className="h-4 w-4 mr-2" /> تجديد
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
