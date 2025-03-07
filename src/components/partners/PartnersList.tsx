
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import PartnerForm from "./PartnerForm";
import CapitalInfo from "./CapitalInfo";

const PartnersList: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const fetchPartners = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPartners(data || []);
      
      if (showToast) {
        toast({
          title: "تم تحديث البيانات",
          description: "تم تحديث قائمة الشركاء بنجاح.",
        });
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات الشركاء.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPartners();
  }, []);
  
  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerToDelete);
        
      if (error) throw error;
      
      setPartners(partners.filter(partner => partner.id !== partnerToDelete));
      toast({
        title: "تم حذف الشريك",
        description: "تم حذف الشريك بنجاح من قائمة الشركاء.",
      });
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف الشريك",
        description: "حدث خطأ أثناء محاولة حذف الشريك.",
      });
    } finally {
      setPartnerToDelete(null);
    }
  };
  
  const calculateTotalCapital = () => {
    return partners.reduce((sum, partner) => sum + (partner.share_value || 0), 0);
  };
  
  const renderPartnerType = (type: string) => {
    switch(type) {
      case 'individual': return 'فرد';
      case 'company': return 'شركة';
      case 'organization': return 'مؤسسة';
      default: return type;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>الشركاء</CardTitle>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>الشركاء</CardTitle>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة شريك
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة شريك جديد</DialogTitle>
              </DialogHeader>
              <PartnerForm
                onSuccess={() => {
                  setIsFormDialogOpen(false);
                  fetchPartners();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <CapitalInfo totalCapital={calculateTotalCapital()} partnersCount={partners.length} />
          
          {partners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا يوجد شركاء حاليًا</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsFormDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                إضافة شريك جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">نوع الشريك</TableHead>
                    <TableHead className="text-right">نسبة الملكية</TableHead>
                    <TableHead className="text-right">قيمة الحصة</TableHead>
                    <TableHead className="text-right">بيانات الاتصال</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{renderPartnerType(partner.partner_type)}</TableCell>
                      <TableCell>{partner.ownership_percentage}%</TableCell>
                      <TableCell>{formatCurrency(partner.share_value)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {partner.contact_info && typeof partner.contact_info === 'object' && (
                            <>
                              {partner.contact_info.email && (
                                <div className="text-sm">{partner.contact_info.email}</div>
                              )}
                              {partner.contact_info.phone && (
                                <div className="text-sm">{partner.contact_info.phone}</div>
                              )}
                            </>
                          )}
                          {(!partner.contact_info || Object.keys(partner.contact_info).length === 0) && (
                            <div className="text-sm text-muted-foreground">لا توجد بيانات</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setPartnerToDelete(partner.id)}
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
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!partnerToDelete} onOpenChange={() => setPartnerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الشريك</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الشريك؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePartner} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PartnersList;
