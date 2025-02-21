
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
import { Pencil, Trash2, AlertCircle } from "lucide-react";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Partner = {
  id: string;
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
  contact_info: {
    email?: string;
    phone?: string;
  };
  created_at: string;
};

export default function PartnersList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Partner[];
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

  return (
    <>
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
                <TableCell>{partner.contact_info?.email || '-'}</TableCell>
                <TableCell>
                  {format(new Date(partner.created_at), 'dd MMMM yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setPartnerToDelete(partner);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
