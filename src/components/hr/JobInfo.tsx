
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type JobInfoProps = {
  position: string;
  department: string;
  salary: number;
  joiningDate: string;
  contractType: string;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  gosiSubscription: number;
  onInputChange: (field: string, value: string | number) => void;
};

export default function JobInfo({
  position,
  department,
  salary,
  joiningDate,
  contractType,
  baseSalary,
  housingAllowance,
  transportationAllowance,
  gosiSubscription,
  onInputChange,
}: JobInfoProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>المسمى الوظيفي</Label>
            <Input
              value={position}
              onChange={(e) => onInputChange("position", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>القسم</Label>
            <Input
              value={department}
              onChange={(e) => onInputChange("department", e.target.value)}
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

          <div className="space-y-2">
            <Label>الراتب الأساسي</Label>
            <Input
              type="number"
              value={baseSalary}
              onChange={(e) => onInputChange("baseSalary", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>بدل السكن</Label>
            <Input
              type="number"
              value={housingAllowance}
              onChange={(e) => onInputChange("housingAllowance", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>بدل المواصلات</Label>
            <Input
              type="number"
              value={transportationAllowance}
              onChange={(e) => onInputChange("transportationAllowance", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>اشتراك التأمينات الاجتماعية</Label>
            <Input
              type="number"
              value={gosiSubscription}
              onChange={(e) => onInputChange("gosiSubscription", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <Label>إجمالي الراتب</Label>
            <span className="text-xl font-bold">
              {(baseSalary + housingAllowance + transportationAllowance).toLocaleString()} ريال
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
