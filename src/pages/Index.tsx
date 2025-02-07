
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Index() {
  const [companyType, setCompanyType] = useState("");
  const [capital, setCapital] = useState("");
  const [partners, setPartners] = useState([
    { name: "", role: "", shares: "", value: "" },
  ]);

  const addPartner = () => {
    setPartners([...partners, { name: "", role: "", shares: "", value: "" }]);
  };

  const updatePartner = (index: number, field: string, value: string) => {
    const newPartners = [...partners];
    newPartners[index] = { ...newPartners[index], [field]: value };
    setPartners(newPartners);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركة الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركاء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {partners.map((partner, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>اسم الشريك</Label>
                  <Input
                    placeholder="الاسم"
                    value={partner.name}
                    onChange={(e) => updatePartner(index, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدور</Label>
                  <Select
                    value={partner.role}
                    onValueChange={(value) => updatePartner(index, "role", value)}
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
                </div>
                <div className="space-y-2">
                  <Label>عدد الحصص</Label>
                  <Input
                    type="number"
                    placeholder="عدد الحصص"
                    value={partner.shares}
                    onChange={(e) => updatePartner(index, "shares", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>قيمة الحصة</Label>
                  <Input
                    type="number"
                    placeholder="قيمة الحصة"
                    value={partner.value}
                    onChange={(e) => updatePartner(index, "value", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button onClick={addPartner} variant="outline" className="w-full">
              إضافة شريك جديد
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
