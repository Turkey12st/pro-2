
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
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            المستندات المنتهية قريباً
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[60px] flex items-center justify-center">
            <p className="text-xs text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringDocuments.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            المستندات المنتهية قريباً
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">لا توجد مستندات منتهية خلال 30 يوم.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          المستندات المنتهية قريباً
        </CardTitle>
        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => navigate("/documents")}>
          <FileText className="h-3 w-3 mr-1" /> إدارة
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {expiringDocuments.slice(0, 3).map((document) => (
          <Alert key={document.id} variant={document.days_remaining <= 7 ? "destructive" : "default"} className="py-2 px-3">
            <AlertCircle className="h-3 w-3" />
            <AlertTitle className="flex items-center justify-between text-xs">
              <span className="truncate max-w-[120px]">{document.title}</span>
              {document.days_remaining <= 7 && (
                <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded-full">عاجل</span>
              )}
            </AlertTitle>
            <AlertDescription className="mt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">المتبقي:</span>
                <span className={`font-semibold ${document.days_remaining <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                  {document.days_remaining} {document.days_remaining === 1 ? "يوم" : "أيام"}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        ))}
        {expiringDocuments.length > 3 && (
          <div className="text-center pt-1">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => navigate("/documents")}>
              عرض الكل ({expiringDocuments.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
