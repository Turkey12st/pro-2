
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmployeeCostCalculator() {
  const [baseSalary, setBaseSalary] = useState(0);
  const [housingAllowance, setHousingAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [nationality, setNationality] = useState<'saudi' | 'non-saudi'>('saudi');
  const [transferCount, setTransferCount] = useState(1);

  // التأمينات الاجتماعية - حسب النظام السعودي
  const GOSI_SAUDI_EMPLOYEE_RATE = 0.1;
  const GOSI_SAUDI_COMPANY_RATE = 0.12;
  const GOSI_NON_SAUDI_COMPANY_RATE = 0.02;

  // رسوم العمالة الوافدة
  const LABOR_FEE_PER_MONTH = 800;

  // رسوم نقل الكفالة
  const transferFees = {
    1: 2000,
    2: 4000,
    3: 6000
  };

  // التأمين الطبي
  const MEDICAL_INSURANCE_COST = 2000;

  // رسوم التأشيرة
  const VISA_FEE = 2000;

  const [totalCost, setTotalCost] = useState(0);
  const [employeeGosiCost, setEmployeeGosiCost] = useState(0);
  const [companyGosiCost, setCompanyGosiCost] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [laborFees, setLaborFees] = useState(0);
  const [currentTransferFee, setCurrentTransferFee] = useState(0);

  useEffect(() => {
    const calculateCosts = () => {
      const totalSalaryAmount = baseSalary + housingAllowance + transportAllowance;
      setTotalSalary(totalSalaryAmount);

      let employeeGosi = 0;
      let companyGosi = 0;
      let laborFeeCost = 0;
      
      if (nationality === 'saudi') {
        employeeGosi = baseSalary * GOSI_SAUDI_EMPLOYEE_RATE;
        companyGosi = baseSalary * GOSI_SAUDI_COMPANY_RATE;
      } else {
        companyGosi = baseSalary * GOSI_NON_SAUDI_COMPANY_RATE;
        laborFeeCost = LABOR_FEE_PER_MONTH;
      }

      setEmployeeGosiCost(employeeGosi);
      setCompanyGosiCost(companyGosi);
      setLaborFees(laborFeeCost);
      setCurrentTransferFee(transferFees[transferCount as keyof typeof transferFees] || 0);

      const totalCostAmount = totalSalaryAmount + 
                            companyGosi + 
                            MEDICAL_INSURANCE_COST + 
                            (nationality === 'non-saudi' ? laborFeeCost : 0);

      setTotalCost(totalCostAmount);
    };

    calculateCosts();
  }, [baseSalary, housingAllowance, transportAllowance, nationality, transferCount]);

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
            <Label>الجنسية</Label>
            <Select value={nationality} onValueChange={(value: 'saudi' | 'non-saudi') => setNationality(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الجنسية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saudi">سعودي</SelectItem>
                <SelectItem value="non-saudi">غير سعودي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {nationality === 'non-saudi' && (
            <div className="space-y-2">
              <Label>عدد مرات نقل الكفالة</Label>
              <Select 
                value={transferCount.toString()} 
                onValueChange={(value) => setTransferCount(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر عدد مرات النقل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">المرة الأولى</SelectItem>
                  <SelectItem value="2">المرة الثانية</SelectItem>
                  <SelectItem value="3">المرة الثالثة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span>إجمالي الراتب الشهري:</span>
            <span className="font-bold">
              {formatNumber(totalSalary)} ريال
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>مساهمة الموظف في التأمينات:</span>
            <span className="font-bold text-primary">
              {formatNumber(employeeGosiCost)} ريال
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>مساهمة الشركة في التأمينات:</span>
            <span className="font-bold text-primary">
              {formatNumber(companyGosiCost)} ريال
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>تكلفة التأمين الطبي:</span>
            <span className="font-bold">
              {formatNumber(MEDICAL_INSURANCE_COST)} ريال
            </span>
          </div>
          {nationality === 'non-saudi' && (
            <>
              <div className="flex justify-between items-center">
                <span>المقابل المالي:</span>
                <span className="font-bold">
                  {formatNumber(laborFees)} ريال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>رسوم التأشيرة:</span>
                <span className="font-bold">
                  {formatNumber(VISA_FEE)} ريال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>رسوم نقل الكفالة:</span>
                <span className="font-bold">
                  {formatNumber(currentTransferFee)} ريال
                </span>
              </div>
            </>
          )}
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
