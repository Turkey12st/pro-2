import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Partner } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatNumber, formatPercentage } from "@/utils/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tables } from "@/integrations/supabase/types";

type CompanyPartnerRecord = Tables<"company_partners">;

export function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCapital, setTotalCapital] = useState(0);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const transformPartnerData = (item: CompanyPartnerRecord): Partner => {
    let contactInfo: Record<string, any> = {};
    
    if (item.contact_info) {
      if (typeof item.contact_info === 'object') {
        contactInfo = item.contact_info as Record<string, any>;
      } else if (typeof item.contact_info === 'string') {
        try {
          contactInfo = JSON.parse(item.contact_info);
        } catch (e) {
          console.error("Failed to parse contact_info string:", e);
        }
      }
    }
    
    const phone = contactInfo?.phone?.toString() || '';
    const email = contactInfo?.email?.toString() || '';
    
    const id = item.id ? item.id.toString() : String(Date.now());
    
    return {
      id,
      name: item.name || '',
      nationality: 'غير محدد',
      identity_number: 'غير محدد',
      capital_amount: item.share_value || 0,
      capital_percentage: item.ownership_percentage || 0,
      contact_phone: phone,
      contact_email: email,
      position: 'شريك',
      created_at: item.created_at
    };
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_partners')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const partnersData: Partner[] = data.map(transformPartnerData);
        
        setPartners(partnersData);
        
        const total = partnersData.reduce((sum, partner) => sum + (partner.capital_amount || 0), 0);
        setTotalCapital(total);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "خطأ في جلب بيانات الشركاء",
        description: "حدث خطأ أثناء محاولة جلب بيانات الشركاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    
    try {
      const { error } = await supabase
        .from('company_partners')
        .delete()
        .eq('id', partnerToDelete);
      
      if (error) throw error;
      
      toast({
        title: "تم حذف الشريك بنجاح",
        description: "تم حذف بيانات الشريك من النظام",
        variant: "default",
      });
      
      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        title: "خطأ في حذف الشريك",
        description: "حدث خطأ أثناء محاولة حذف بيانات الشريك",
        variant: "destructive",
      });
    } finally {
      setPartnerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">الشركاء والمساهمين</h2>
        <Button onClick={() => navigate("/partners/add")}>
          <Plus className="mr-2 h-4 w-4" /> إضافة شريك
        </Button>
      </div>

      <CapitalInfo totalCapital={totalCapital} partnersCount={partners.length} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">قائمة الشركاء</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">جاري تحميل البيانات...</div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">لا يوجد شركاء</h3>
              <p className="text-muted-foreground mt-2">لم يتم إضافة أي شركاء بعد. قم بإضافة شريك جديد للبدء.</p>
              <Button onClick={() => navigate("/partners/add")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> إضافة شريك جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">اسم الشريك</TableHead>
                    <TableHead>الجنسية</TableHead>
                    <TableHead>رقم الهوية</TableHead>
                    <TableHead>رأس المال</TableHead>
                    <TableHead>النسبة</TableHead>
                    <TableHead>المنصب</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.nationality}</TableCell>
                      <TableCell>{partner.identity_number}</TableCell>
                      <TableCell>{formatNumber(partner.capital_amount)} ريال</TableCell>
                      <TableCell>{formatPercentage(partner.capital_percentage)}</TableCell>
                      <TableCell>{partner.position}</TableCell>
                      <TableCell className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/partners/edit/${partner.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPartnerToDelete(partner.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      </Card>

      <AlertDialog open={!!partnerToDelete} onOpenChange={() => setPartnerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الشريك؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع بيانات الشريك بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePartner} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CapitalInfoProps {
  totalCapital: number;
  partnersCount: number;
}

function CapitalInfo({ totalCapital, partnersCount }: CapitalInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي رأس المال</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalCapital)} ريال</div>
          <p className="text-xs text-muted-foreground">
            إجمالي رأس مال الشركة المسجل
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد الشركاء</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{partnersCount}</div>
          <p className="text-xs text-muted-foreground">
            إجمالي عدد الشركاء والمساهمين
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
