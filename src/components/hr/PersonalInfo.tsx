
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PersonalInfoProps = {
  name: string;
  identityNumber: string;
  birthDate: string;
  nationality: string;
  email: string;
  phone: string;
  onInputChange: (field: string, value: string) => void;
};

export default function PersonalInfo({
  name,
  identityNumber,
  birthDate,
  nationality,
  email,
  phone,
  onInputChange,
}: PersonalInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>الاسم الكامل</Label>
        <Input
          value={name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="أدخل اسم الموظف"
        />
      </div>
      <div className="space-y-2">
        <Label>رقم الهوية</Label>
        <Input
          value={identityNumber}
          onChange={(e) => onInputChange("identityNumber", e.target.value)}
          placeholder="أدخل رقم الهوية"
        />
      </div>
      <div className="space-y-2">
        <Label>تاريخ الميلاد</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => onInputChange("birthDate", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>الجنسية</Label>
        <Input
          value={nationality}
          onChange={(e) => onInputChange("nationality", e.target.value)}
          placeholder="أدخل الجنسية"
        />
      </div>
      <div className="space-y-2">
        <Label>البريد الإلكتروني</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="أدخل البريد الإلكتروني"
        />
      </div>
      <div className="space-y-2">
        <Label>رقم الهاتف</Label>
        <Input
          value={phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          placeholder="أدخل رقم الهاتف"
        />
      </div>
    </div>
  );
}
