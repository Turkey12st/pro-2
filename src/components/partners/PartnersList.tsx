import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PartnersCapitalInfo } from "./PartnersCapitalInfo";
import { PartnersTable } from "./PartnersTable";
import { DocumentUploadDialog } from "./DocumentUploadDialog";

interface PartnerData {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  identity_number?: string;
  national_id?: string;
  capital_amount: number;
  capital_percentage: number;
  ownership_percentage: number;
  share_value: number;
  position?: string;
  role?: string;
  partner_type: string;
  contact_info: any;
  documents: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
}

export function PartnersList() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCapital, setTotalCapital] = useState(0);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_partners')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const partnersData: PartnerData[] = data.map((item) => {
          // معالجة المستندات بطريقة آمنة
          let documents: Array<{ name: string; url: string; type: string }> = [];
          if (Array.isArray(item.documents)) {
            documents = item.documents.map((doc: any) => ({
              name: doc?.name || "",
              url: doc?.url || "",
              type: doc?.type || ""
            }));
          }

          return {
            id: crypto.randomUUID(), // إنشاء ID مؤقت للعرض
            name: item.name || '',
            first_name: (item.contact_info as any)?.first_name,
            last_name: (item.contact_info as any)?.last_name,
            nationality: (item.contact_info as any)?.nationality,
            identity_number: (item.contact_info as any)?.identity_number,
            national_id: (item.contact_info as any)?.national_id,
            capital_amount: Number(item.share_value || 0),
            capital_percentage: Number(item.ownership_percentage || 0),
            ownership_percentage: Number(item.ownership_percentage || 0),
            share_value: Number(item.share_value || 0),
            position: (item.contact_info as any)?.position,
            role: (item.contact_info as any)?.role,
            partner_type: item.partner_type || 'individual',
            contact_info: item.contact_info || {},
            documents,
            created_at: item.created_at || new Date().toISOString()
          };
        });
        
        setPartners(partnersData);
        
        const total = partnersData.reduce((sum, partner) => {
          return sum + Number(partner.capital_amount || 0);
        }, 0);
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
        .eq('name', partnerToDelete); // استخدام الاسم بدلاً من ID
      
      if (error) throw error;
      
      toast({
        title: "تم حذف الشريك بنجاح",
        description: "تم حذف بيانات الشريك من النظام",
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

  const handleUploadDocument = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowDocumentUpload(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">الشركاء والمساهمين</h2>
        <Button onClick={() => navigate("/partners/add")}>
          <Plus className="mr-2 h-4 w-4" /> إضافة شريك
        </Button>
      </div>

      <PartnersCapitalInfo totalCapital={totalCapital} partnersCount={partners.length} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">قائمة الشركاء</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnersTable 
            partners={partners} 
            loading={loading} 
            onDelete={setPartnerToDelete} 
            onUploadDocument={handleUploadDocument} 
          />
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

      <DocumentUploadDialog 
        open={showDocumentUpload}
        partnerId={selectedPartnerId} 
        onOpenChange={setShowDocumentUpload}
        onSuccess={() => {
          setShowDocumentUpload(false);
          fetchPartners();
        }}
      />
    </div>
  );
}
