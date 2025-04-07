
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye, AlertTriangle, FileText, Download } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("company_documents")
        .select("*")
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      if (data) {
        // Process the data and add missing fields to match Document type
        const processedDocuments = data.map(doc => {
          const expiryDate = new Date(doc.expiry_date);
          const today = new Date();
          const daysRemaining = differenceInDays(expiryDate, today);
          
          let status: 'active' | 'expired' | 'soon-expire';
          
          if (daysRemaining < 0) {
            status = 'expired';
          } else if (daysRemaining < 30) {
            status = 'soon-expire';
          } else {
            status = 'active';
          }
          
          // Create a document that matches our Document interface
          const document: Document = {
            id: doc.id,
            title: doc.title,
            description: '',
            file_url: doc.document_url || '',
            document_type: doc.type || '',
            status: status,
            created_at: doc.created_at,
            // Additional fields from company_documents
            type: doc.type,
            number: doc.number || '',
            issue_date: doc.issue_date,
            expiry_date: doc.expiry_date,
            document_url: doc.document_url
          };
          
          return document;
        });

        setDocuments(processedDocuments);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات المستندات",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستند بنجاح",
      });
      
      // تحديث القائمة
      setDocuments(prev => prev.filter(doc => doc.id !== deleteId));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المستند",
        description: "حدث خطأ أثناء محاولة حذف المستند",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">ساري</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'soon-expire':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">قريب الانتهاء</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = differenceInDays(expiry, today);
    
    if (days < 0) {
      return <span className="text-red-500">انتهى منذ {Math.abs(days)} يوم</span>;
    } else if (days === 0) {
      return <span className="text-yellow-500">ينتهي اليوم</span>;
    } else {
      return <span className={days < 30 ? "text-yellow-500" : "text-green-500"}>متبقي {days} يوم</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>المستندات والتراخيص</CardTitle>
        <CardDescription>
          قائمة بجميع مستندات وتراخيص الشركة وتواريخ انتهائها
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">لا توجد مستندات</h3>
            <p className="text-muted-foreground mt-2">لم يتم إضافة أي مستندات بعد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستند</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرقم</TableHead>
                  <TableHead>تاريخ الإصدار</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>المتبقي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell dir="ltr">{doc.number || '-'}</TableCell>
                    <TableCell>
                      {doc.issue_date && format(new Date(doc.issue_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {doc.expiry_date && format(new Date(doc.expiry_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell>{doc.expiry_date && getDaysRemaining(doc.expiry_date)}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="flex items-center space-x-2 space-x-reverse">
                      {doc.document_url && (
                        <Button variant="ghost" size="sm" className="text-blue-500">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">تنزيل</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">تعديل</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">حذف</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المستند</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المستند؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
