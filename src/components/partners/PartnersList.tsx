import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus, Trash, Phone, Mail, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PartnerForm from "./PartnerForm";
import { Partner } from "@/types/database";

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company_partners")
        .select("*");

      if (error) {
        throw error;
      }

      // تأكد من أن البيانات تطابق النوع المطلوب
      const validPartners: Partner[] = (data || []).map((item: any) => ({
        id: item.id || "",
        name: item.name || "",
        partner_type: item.partner_type || "individual",
        ownership_percentage: item.ownership_percentage || 0,
        share_value: item.share_value || 0,
        contact_info: item.contact_info || {},
        documents: item.documents || [],
        created_at: item.created_at || "",
        updated_at: item.updated_at || ""
      }));

      setPartners(validPartners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: "لم نتمكن من جلب بيانات الشركاء",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditPartner = (partner: Partner) => {
    if (partner.id) {
      setSelectedPartnerId(partner.id);
      setOpenDialog(true);
    } else {
      toast({
        variant: "destructive",
        title: "خطأ في التعديل",
        description: "لا يمكن تعديل هذا الشريك، الرجاء المحاولة مرة أخرى",
      });
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!partnerId) return;
    
    try {
      const { error } = await supabase
        .from("company_partners")
        .delete()
        .eq("id", partnerId);

      if (error) throw error;

      toast({
        title: "تم حذف الشريك",
        description: "تم حذف بيانات الشريك بنجاح",
      });

      // تحديث قائمة الشركاء
      setPartners((prev) => prev.filter((p) => p.id !== partnerId));
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف البيانات",
        description: "لم نتمكن من حذف بيانات الشريك",
      });
    }
  };

  const onPartnerSaved = () => {
    setOpenDialog(false);
    setSelectedPartnerId(null);
    fetchPartners();
  };

  const getContactInfo = (contactInfo: any) => {
    if (!contactInfo) return {};
    
    // تحويل البيانات من صيغة JSON إذا كانت سلسلة نصية
    if (typeof contactInfo === 'string') {
      try {
        return JSON.parse(contactInfo);
      } catch (e) {
        return {};
      }
    }
    
    return contactInfo;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">قائمة الشركاء</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPartnerId(null)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة شريك
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle>
              {selectedPartnerId ? "تعديل بيانات الشريك" : "إضافة شريك جديد"}
            </DialogTitle>
            <PartnerForm
              initialData={partners.find(p => p.id === selectedPartnerId)}
              onSuccess={onPartnerSaved}
              onCancel={() => setOpenDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading, empty state, and partner cards */}
      {isLoading ? (
        <div className="text-center p-8">جاري التحميل...</div>
      ) : partners.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">لا يوجد شركاء</h3>
          <p className="text-muted-foreground mb-4">
            لم يتم إضافة أي شركاء بعد، قم بإضافة شريك جديد من خلال زر "إضافة شريك"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => {
            const contact = getContactInfo(partner.contact_info);
            return (
              <Card key={partner.id || partner.created_at}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">
                      {partner.name}
                    </CardTitle>
                    <Badge
                      variant={
                        partner.partner_type === "individual"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {partner.partner_type === "individual"
                        ? "فرد"
                        : "شركة"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">نسبة الملكية</p>
                        <p className="font-medium">
                          {partner.ownership_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">قيمة الحصة</p>
                        <p className="font-medium">
                          {partner.share_value.toLocaleString()} ريال
                        </p>
                      </div>
                    </div>

                    {contact && (
                      <div className="space-y-2">
                        {contact.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {partner.partner_type === "company" && contact.company_name && (
                          <div className="flex items-center text-sm">
                            <Building2 className="h-4 w-4 ml-2 text-muted-foreground" />
                            <span>{contact.company_name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => partner.id && handleDeletePartner(partner.id)}
                      >
                        <Trash className="h-4 w-4 ml-1" /> حذف
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditPartner(partner)}
                      >
                        <Edit className="h-4 w-4 ml-1" /> تعديل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
