
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (doc: Document) => {
    try {
      const path = doc.document_url as string;
      if (!path) return;
      if (path.startsWith("http")) {
        window.open(path, "_blank", "noopener,noreferrer");
        return;
      }
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({ variant: "destructive", title: "تعذر فتح الملف", description: e?.message || "حدث خطأ أثناء تنزيل المستند" });
    }
  };

  const handleSaveEdit = async () => {
    if (!editDoc) return;
    try {
      setSavingEdit(true);
      const { error } = await supabase
        .from("company_documents")
        .update({
          title: editDoc.title,
          number: editDoc.number,
          issue_date: editDoc.issue_date,
          expiry_date: editDoc.expiry_date,
        })
        .eq("id", editDoc.id);
      if (error) throw error;
      toast({ title: "تم التحديث", description: "تم حفظ بيانات المستند" });
      setEditDoc(null);
      fetchDocuments();
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e?.message || "فشل حفظ التعديلات" });
    } finally {
      setSavingEdit(false);
    }
  };

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
        // معالجة البيانات وإضافة حالة المستند
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
          
          return {
            ...doc,
            status,
            id: doc.id,
          } as Document;
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
                      {format(new Date(doc.issue_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.expiry_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell>{getDaysRemaining(doc.expiry_date)}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="flex items-center space-x-2 space-x-reverse">
                      {doc.document_url && (
                        <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">تنزيل</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setEditDoc(doc)}>
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

      <Dialog open={!!editDoc} onOpenChange={(o) => !o && setEditDoc(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>تعديل المستند</DialogTitle>
          </DialogHeader>
          {editDoc && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم المستند</Label>
                <Input value={editDoc.title || ""} onChange={(e) => setEditDoc({ ...editDoc, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>الرقم</Label>
                <Input dir="ltr" value={editDoc.number || ""} onChange={(e) => setEditDoc({ ...editDoc, number: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>تاريخ الإصدار</Label>
                  <Input type="date" value={(editDoc.issue_date || "").slice(0, 10)} onChange={(e) => setEditDoc({ ...editDoc, issue_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الانتهاء</Label>
                  <Input type="date" value={(editDoc.expiry_date || "").slice(0, 10)} onChange={(e) => setEditDoc({ ...editDoc, expiry_date: e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
