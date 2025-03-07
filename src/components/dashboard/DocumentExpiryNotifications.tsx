import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Document, DocumentWithDaysRemaining } from "@/types/database";

export function DocumentExpiryNotifications() {
  const [expiringDocuments, setExpiringDocuments] = useState<DocumentWithDaysRemaining[]>([]);
  const [loading, setLoading] = useState(true);

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

          return {
            ...document,
            days_remaining: daysRemaining,
            id: document.id || crypto.randomUUID(),
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          المستندات التي توشك على الانتهاء
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiringDocuments.map((document) => (
          <Alert key={document.id} variant={document.days_remaining <= 7 ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{document.title}</AlertTitle>
            <AlertDescription className="mt-2">
              <p>تاريخ الانتهاء: {new Date(document.expiry_date).toLocaleDateString('ar-SA')}</p>
              <p className="font-semibold mt-1">
                متبقي: {document.days_remaining} {document.days_remaining === 1 ? "يوم" : "أيام"}
              </p>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
