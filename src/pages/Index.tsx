
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/AppLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { supabase } from "@/hooks/useSupabase";

type Partner = {
  id: string;
  name: string;
  identityNumber: string;
  profession: string;
  birthDate: string;
  nationality: string;
  shares: string;
  country: string;
  shareValue: string;
  role: string;
};

export default function Index() {
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [capital, setCapital] = useState("");
  const [partners, setPartners] = useState<Partner[]>([{
    id: "1",
    name: "",
    identityNumber: "",
    profession: "",
    birthDate: "",
    nationality: "",
    shares: "",
    country: "",
    shareValue: "",
    role: "",
  }]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const saveData = async () => {
    try {
      // حفظ بيانات الشركة
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert({
          name: companyName,
          type: companyType,
          capital: capital,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // حفظ بيانات الشركاء
      const partnersToSave = partners.map(partner => ({
        ...partner,
        company_id: companyData.id
      }));

      const { error: partnersError } = await supabase
        .from('partners')
        .upsert(partnersToSave);

      if (partnersError) throw partnersError;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ بيانات الشركة والشركاء",
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const addPartner = () => {
    setPartners([...partners, {
      id: Date.now().toString(),
      name: "",
      identityNumber: "",
      profession: "",
      birthDate: "",
      nationality: "",
      shares: "",
      country: "",
      shareValue: "",
      role: "",
    }]);
    toast({
      title: "تم إضافة شريك جديد",
      description: "يمكنك الآن إدخال بيانات الشريك",
    });
  };

  const updatePartner = (id: string, field: keyof Partner, value: string) => {
    const newPartners = partners.map(partner => 
      partner.id === id ? { ...partner, [field]: value } : partner
    );
    setPartners(newPartners);
  };

  const confirmDeletePartner = (id: string) => {
    setPartnerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePartner = () => {
    if (partnerToDelete && partners.length > 1) {
      const newPartners = partners.filter(partner => partner.id !== partnerToDelete);
      setPartners(newPartners);
      toast({
        title: "تم حذف الشريك",
        description: "تم حذف بيانات الشريك بنجاح",
      });
    }
    setDeleteDialogOpen(false);
  };

  const calculateTotalSharesValue = (partner: Partner) => {
    const shareValue = parseFloat(partner.shareValue) || 0;
    const numShares = parseFloat(partner.shares) || 0;
    return shareValue * numShares;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              معلومات الشركة الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>اسم الشركة</Label>
                <Input
                  placeholder="أدخل اسم الشركة"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الشركة</Label>
                <Select value={companyType} onValueChange={setCompanyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الشركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llc">شركة ذات مسؤولية محدودة</SelectItem>
                    <SelectItem value="jsc">شركة مساهمة</SelectItem>
                    <SelectItem value="sole">مؤسسة فردية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رأس المال</Label>
                <Input
                  type="number"
                  placeholder="أدخل رأس المال"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={saveData} className="w-full">
              حفظ البيانات
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-primary">معلومات الشركاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-right">الطرف</th>
                    <th className="p-2 text-right">اسم الشريك</th>
                    <th className="p-2 text-right">رقم الهوية</th>
                    <th className="p-2 text-right">المهنة</th>
                    <th className="p-2 text-right">تاريخ الميلاد</th>
                    <th className="p-2 text-right">الجنسية</th>
                    <th className="p-2 text-right">الحصص</th>
                    <th className="p-2 text-right">الدولة</th>
                    <th className="p-2 text-right">قيمة الحصة</th>
                    <th className="p-2 text-right">إجمالي قيمة الحصص</th>
                    <th className="p-2 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b hover:bg-accent/5">
                      <td className="p-2">
                        <Select
                          value={partner.role}
                          onValueChange={(value) => updatePartner(partner.id, "role", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">شريك فعال</SelectItem>
                            <SelectItem value="silent">شريك صامت</SelectItem>
                            <SelectItem value="employee">موظف شريك</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          value={partner.name}
                          onChange={(e) => updatePartner(partner.id, "name", e.target.value)}
                          placeholder="الاسم"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={partner.identityNumber}
                          onChange={(e) => updatePartner(partner.id, "identityNumber", e.target.value)}
                          placeholder="رقم الهوية"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={partner.profession}
                          onChange={(e) => updatePartner(partner.id, "profession", e.target.value)}
                          placeholder="المهنة"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={partner.birthDate}
                          onChange={(e) => updatePartner(partner.id, "birthDate", e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={partner.nationality}
                          onChange={(e) => updatePartner(partner.id, "nationality", e.target.value)}
                          placeholder="الجنسية"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={partner.shares}
                          onChange={(e) => updatePartner(partner.id, "shares", e.target.value)}
                          placeholder="عدد الحصص"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={partner.country}
                          onChange={(e) => updatePartner(partner.id, "country", e.target.value)}
                          placeholder="الدولة"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={partner.shareValue}
                          onChange={(e) => updatePartner(partner.id, "shareValue", e.target.value)}
                          placeholder="قيمة الحصة"
                        />
                      </td>
                      <td className="p-2 font-semibold">
                        {calculateTotalSharesValue(partner).toLocaleString()} ريال
                      </td>
                      <td className="p-2">
                        {partners.length > 1 && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDeletePartner(partner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Button onClick={addPartner} variant="outline" className="w-full">
                إضافة شريك جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد حذف الشريك</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من رغبتك في حذف بيانات هذا الشريك؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePartner}>تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
