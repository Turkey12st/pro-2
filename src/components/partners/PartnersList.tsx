
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Partner } from "@/types/database";

export default function PartnersList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      console.log("جاري تحميل بيانات الشركاء...");
      const { data, error } = await supabase
        .from("company_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("خطأ في استرجاع بيانات الشركاء:", error);
        throw error;
      }
      
      console.log("تم استرجاع بيانات الشركاء:", data);
      
      // التحويل إلى كائن Partner منظم
      return data.map(partner => {
        const contactInfo = typeof partner.contact_info === 'object' && partner.contact_info
          ? {
              email: (partner.contact_info as Record<string, string>).email || undefined,
              phone: (partner.contact_info as Record<string, string>).phone || undefined,
            }
          : { email: undefined, phone: undefined };

        const documents = Array.isArray(partner.documents) ? partner.documents : [];

        return {
          id: partner.id || crypto.randomUUID(),
          name: partner.name,
          partner_type: partner.partner_type || 'individual',
          ownership_percentage: partner.ownership_percentage,
          share_value: partner.share_value || 0,
          contact_info: contactInfo,
          documents: documents,
          created_at: partner.created_at,
          updated_at: partner.updated_at
        } satisfies Partner;
      });
    },
  });

  const handleDelete = async (partner: Partner) => {
    try {
      const { error } = await supabase
        .from("company_partners")
        .delete()
        .eq("id", partner.id);

      if (error) throw error;

      toast({
        title: "تم حذف الشريك بنجاح",
        description: `تم حذف الشريك ${partner.name} بنجاح`,
      });

      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء محاولة حذف الشريك",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">لا يوجد شركاء حالياً</p>
        <Button onClick={() => navigate("/partners/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة شريك جديد
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => navigate("/partners/new")} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة شريك جديد
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>إضافة شريك جديد للشركة</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الشريك</TableHead>
              <TableHead>نوع الشريك</TableHead>
              <TableHead>نسبة الملكية</TableHead>
              <TableHead>قيمة الحصة</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners?.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell>{partner.name}</TableCell>
                <TableCell>
                  {partner.partner_type === 'individual' ? 'فرد' : 'شركة'}
                </TableCell>
                <TableCell>{partner.ownership_percentage}%</TableCell>
                <TableCell>{formatNumber(partner.share_value)} ريال</TableCell>
                <TableCell>{partner.contact_info.email || '-'}</TableCell>
                <TableCell>
                  {format(new Date(partner.created_at), 'dd MMMM yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/partners/edit/${partner.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>تعديل بيانات الشريك</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setPartnerToDelete(partner);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>حذف الشريك</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              هل أنت متأكد من حذف الشريك؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
              سيتم حذف جميع بيانات الشريك نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => partnerToDelete && handleDelete(partnerToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
