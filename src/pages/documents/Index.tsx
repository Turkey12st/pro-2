
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  AlertTriangle,
  Check,
  Calendar,
  Clock,
  Trash2,
  PenLine
} from "lucide-react";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { Document } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

export default function DocumentsPage() {
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['company_documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      
      return data as Document[];
    }
  });

  const calculateStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = differenceInDays(expiry, today);
    
    if (daysRemaining < 0) {
      return { status: 'expired', daysRemaining: daysRemaining };
    } else if (daysRemaining <= 30) {
      return { status: 'soon-expire', daysRemaining: daysRemaining };
    } else {
      return { status: 'active', daysRemaining: daysRemaining };
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'expired':
        return { variant: 'destructive', text: 'منتهي' };
      case 'soon-expire':
        return { variant: 'warning', text: 'قرب الانتهاء' };
      case 'active':
        return { variant: 'success', text: 'ساري' };
      default:
        return { variant: 'secondary', text: 'غير معروف' };
    }
  };

  const formatRemainingTime = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} يوم منذ الانتهاء`;
    } else if (days === 0) {
      return 'ينتهي اليوم';
    } else {
      return `${days} يوم متبقي`;
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "تم حذف المستند بنجاح",
        description: "تم حذف بيانات المستند من قاعدة البيانات"
      });
      
      refetch();
      setDocumentToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("خطأ في حذف المستند:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المستند",
        description: "حدث خطأ أثناء محاولة حذف المستند"
      });
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowDocumentDialog(true);
  };

  const handleDocumentFormSuccess = () => {
    setShowDocumentDialog(false);
    setEditingDocument(null);
    refetch();
  };

  // إنشاء تنبيهات للوثائق التي ستنتهي قريباً
  useEffect(() => {
    if (!documents) return;

    const createNotifications = async () => {
      const expiringSoonDocuments = documents.filter(doc => {
        const { status } = calculateStatus(doc.expiry_date);
        return status === 'soon-expire';
      });

      if (expiringSoonDocuments.length === 0) return;

      try {
        for (const doc of expiringSoonDocuments) {
          const { daysRemaining } = calculateStatus(doc.expiry_date);
          
          // التحقق من أن القيمة موجودة في مصفوفة أيام التذكير
          if (doc.reminder_days && doc.reminder_days.includes(daysRemaining)) {
            const { data: existingNotifications, error: queryError } = await supabase
              .from('notifications')
              .select('*')
              .eq('reference_id', doc.id)
              .eq('reference_type', 'document')
              .eq('type', `expires-in-${daysRemaining}-days`);
            
            if (queryError) throw queryError;
            
            // إنشاء تنبيه جديد فقط إذا لم يكن موجوداً بالفعل
            if (!existingNotifications || existingNotifications.length === 0) {
              const priority = daysRemaining <= 7 ? 'high' : (daysRemaining <= 14 ? 'medium' : 'low');
              
              await supabase.from('notifications').insert({
                title: `تنبيه انتهاء مستند: ${doc.title}`,
                description: `سينتهي المستند "${doc.title}" خلال ${daysRemaining} يوم. يرجى تجديده في أقرب وقت.`,
                type: `expires-in-${daysRemaining}-days`,
                reference_id: doc.id,
                reference_type: 'document',
                priority: priority,
                due_date: doc.expiry_date
              });
            }
          }
        }
      } catch (error) {
        console.error("خطأ في إنشاء التنبيهات:", error);
      }
    };

    createNotifications();
  }, [documents]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">إدارة المستندات والوثائق</h1>
          <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة مستند جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingDocument ? 'تعديل المستند' : 'إضافة مستند جديد'}</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المستند بدقة. ستظهر تنبيهات عند قرب انتهاء المستند.
                </DialogDescription>
              </DialogHeader>
              <DocumentForm 
                initialData={editingDocument} 
                onSuccess={handleDocumentFormSuccess} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المستندات والوثائق
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">جاري تحميل البيانات...</div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg mb-4">لا توجد مستندات مسجلة حتى الآن</p>
                <Button 
                  onClick={() => setShowDocumentDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  إضافة أول مستند
                </Button>
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
                      <TableHead>المدة المتبقية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => {
                      const { status, daysRemaining } = calculateStatus(document.expiry_date);
                      const statusInfo = getStatusVariant(status);
                      
                      return (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">{document.title}</TableCell>
                          <TableCell>{document.type}</TableCell>
                          <TableCell dir="ltr">{document.number || '-'}</TableCell>
                          <TableCell>{format(new Date(document.issue_date), 'yyyy/MM/dd', { locale: ar })}</TableCell>
                          <TableCell>{format(new Date(document.expiry_date), 'yyyy/MM/dd', { locale: ar })}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className={`flex items-center gap-1 ${status === 'expired' ? 'text-destructive' : 
                              status === 'soon-expire' ? 'text-amber-500' : 'text-green-600'}`}>
                              <Clock className="h-4 w-4" />
                              {formatRemainingTime(daysRemaining)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                statusInfo.variant === 'destructive' ? 'destructive' : 
                                statusInfo.variant === 'warning' ? 'outline' : 
                                'outline'
                              } 
                              className={
                                status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                                status === 'soon-expire' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                                'bg-red-100 text-red-800 hover:bg-red-200'
                              }
                            >
                              {status === 'active' ? (
                                <Check className="h-3.5 w-3.5 mr-1" />
                              ) : status === 'soon-expire' ? (
                                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                              )}
                              {statusInfo.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditDocument(document)}
                              >
                                <PenLine className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setDocumentToDelete(document);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستند؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستند "{documentToDelete?.title}" بشكل نهائي من قاعدة البيانات.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
