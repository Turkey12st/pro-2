
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Calculator as CalculatorIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

export function LoanCalculator() {
  const [amount, setAmount] = useState<number>(100000);
  const [rate, setRate] = useState<number>(5);
  const [term, setTerm] = useState<number>(60); // months
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = () => {
    // Monthly interest rate
    const monthlyRate = rate / 100 / 12;
    
    // Monthly payment formula: P × (r × (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyPayment = 
      amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
      (Math.pow(1 + monthlyRate, term) - 1);
    
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;
    
    // Calculate amortization schedule
    const schedule = [];
    let balance = amount;
    
    for (let month = 1; month <= term; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal,
        interest,
        balance: balance > 0 ? balance : 0
      });
    }
    
    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortizationSchedule: schedule
    });

    toast({
      title: "تم حساب القرض",
      description: "تم حساب أقساط القرض والفوائد بنجاح",
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-amount">مبلغ القرض</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="loan-amount"
                    value={[amount]}
                    min={10000}
                    max={1000000}
                    step={10000}
                    onValueChange={(values) => setAmount(values[0])}
                    className="flex-1 ml-4 rtl:ml-0 rtl:mr-4"
                  />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-24 text-left"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(amount)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest-rate">معدل الفائدة السنوي (%)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="interest-rate"
                    value={[rate]}
                    min={1}
                    max={20}
                    step={0.25}
                    onValueChange={(values) => setRate(values[0])}
                    className="flex-1 ml-4 rtl:ml-0 rtl:mr-4"
                  />
                  <Input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-24 text-left"
                  />
                </div>
                <p className="text-sm text-muted-foreground">{rate}%</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-term">مدة القرض (شهر)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="loan-term"
                    value={[term]}
                    min={12}
                    max={360}
                    step={12}
                    onValueChange={(values) => setTerm(values[0])}
                    className="flex-1 ml-4 rtl:ml-0 rtl:mr-4"
                  />
                  <Input
                    type="number"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="w-24 text-left"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {term} شهر ({(term / 12).toFixed(1)} سنة)
                </p>
              </div>

              <Button 
                onClick={calculateLoan} 
                className="w-full"
              >
                <CalculatorIcon className="ml-2 h-4 w-4" />
                حساب القرض
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">ملخص القرض</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">القسط الشهري</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(result.monthlyPayment)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">إجمالي المدفوعات</div>
                      <div className="text-xl font-semibold">
                        {formatCurrency(result.totalPayment)}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">إجمالي الفائدة</div>
                      <div className="text-xl font-semibold">
                        {formatCurrency(result.totalInterest)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    * هذه الحسابات تقديرية وقد تختلف عن الأرقام الفعلية من البنك
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {result && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">جدول السداد (أول 12 شهر)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-right">الشهر</th>
                    <th className="border p-2 text-right">القسط</th>
                    <th className="border p-2 text-right">أصل القرض</th>
                    <th className="border p-2 text-right">الفائدة</th>
                    <th className="border p-2 text-right">الرصيد المتبقي</th>
                  </tr>
                </thead>
                <tbody>
                  {result.amortizationSchedule.slice(0, 12).map((row) => (
                    <tr key={row.month}>
                      <td className="border p-2 text-right">{row.month}</td>
                      <td className="border p-2 text-right">{formatCurrency(row.payment)}</td>
                      <td className="border p-2 text-right">{formatCurrency(row.principal)}</td>
                      <td className="border p-2 text-right">{formatCurrency(row.interest)}</td>
                      <td className="border p-2 text-right">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
