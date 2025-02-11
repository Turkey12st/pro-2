
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobInfoProps = {
  position: string;
  department: string;
  salary: number;
  joiningDate: string;
  contractType: string;
  onInputChange: (field: string, value: string | number) => void;
};

export default function JobInfo({
  position,
  department,
  salary,
  joiningDate,
  contractType,
  onInputChange,
}: JobInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>المنصب</Label>
        <Input
          value={position}
          onChange={(e) => onInputChange("position", e.target.value)}
          placeholder="أدخل المنصب الوظيفي"
        />
      </div>
      <div className="space-y-2">
        <Label>القسم</Label>
        <Input
          value={department}
          onChange={(e) => onInputChange("department", e.target.value)}
          placeholder="أدخل القسم"
        />
      </div>
      <div className="space-y-2">
        <Label>الراتب</Label>
        <Input
          type="number"
          value={salary}
          onChange={(e) => onInputChange("salary", parseFloat(e.target.value))}
          placeholder="أدخل الراتب"
        />
      </div>
      <div className="space-y-2">
        <Label>تاريخ الالتحاق</Label>
        <Input
          type="date"
          value={joiningDate}
          onChange={(e) => onInputChange("joiningDate", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>نوع العقد</Label>
        <Select
          value={contractType}
          onValueChange={(value) => onInputChange("contractType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع العقد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">دوام كامل</SelectItem>
            <SelectItem value="part-time">دوام جزئي</SelectItem>
            <SelectItem value="contract">عقد مؤقت</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
