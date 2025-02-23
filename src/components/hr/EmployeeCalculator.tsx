
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function EmployeeCostCalculator() {
  const [baseSalary, setBaseSalary] = useState(0);
  const [housingAllowance, setHousingAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [gosiPercentage] = useState(9.75); // نسبة التأمينات الاجتماعية للسعوديين

  const [totalCost, setTotalCost] = useState(0);
  const [gosiCost, setGosiCost] = useState(0);

  useEffect(() => {
    const calculateCosts = () => {
      const totalSalary = baseSalary + housingAllowance + transportAllowance;
      const gosiAmount = (baseSalary * gosiPercentage) / 100;
      setGosiCost(gosiAmount);
      setTotalCost(totalSalary + gosiAmount);
    };

    calculateCosts();
  }, [baseSalary, housingAllowance, transportAllowance, gosiPercentage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-5 w-5" />
          حاسبة تكلفة الموظف
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>الراتب الأساسي</Label>
            <Input
              type="number"
              placeholder="أدخل الراتب الأساسي"
              value={baseSalary || ""}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>بدل السكن</Label>
            <Input
              type="number"
              placeholder="أدخل بدل السكن"
              value={housingAllowance || ""}
              onChange={(e) => setHousingAllowance(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>بدل النقل</Label>
            <Input
              type="number"
              placeholder="أدخل بدل النقل"
              value={transportAllowance || ""}
              onChange={(e) => setTransportAllowance(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>نسبة التأمينات الاجتماعية</Label>
            <Input type="text" value={`${gosiPercentage}%`} disabled />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span>إجمالي الرواتب والبدلات:</span>
            <span className="font-bold">
              {formatNumber(baseSalary + housingAllowance + transportAllowance)} ريال
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>تكلفة التأمينات الاجتماعية:</span>
            <span className="font-bold text-primary">
              {formatNumber(gosiCost)} ريال
            </span>
          </div>
          <div className="flex justify-between items-center text-lg border-t pt-2 mt-2">
            <span>إجمالي التكلفة الشهرية:</span>
            <span className="font-bold text-primary">
              {formatNumber(totalCost)} ريال
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
