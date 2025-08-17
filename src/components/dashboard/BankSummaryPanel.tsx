import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  Upload,
  FileText,
  PieChart,
  BarChart3,
  ChevronRight,
  Wallet,
  Building2
} from 'lucide-react';
import { formatCurrencyEnglish } from '@/utils/numberFormatter';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'business';
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export function BankSummaryPanel() {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Mock data - replace with real data
  const bankAccounts: BankAccount[] = [
    {
      id: '1',
      bankName: 'البنك الأهلي',
      accountNumber: '**** 1234',
      balance: 245000,
      currency: 'SAR',
      type: 'business'
    },
    {
      id: '2',
      bankName: 'مصرف الراجحي',
      accountNumber: '**** 5678',
      balance: 156000,
      currency: 'SAR',
      type: 'checking'
    }
  ];

  const monthlyData: MonthlyData[] = [
    { month: 'يناير', income: 120000, expenses: 85000, balance: 245000 },
    { month: 'فبراير', income: 135000, expenses: 92000, balance: 288000 },
    { month: 'مارس', income: 110000, expenses: 78000, balance: 320000 },
    { month: 'أبريل', income: 125000, expenses: 88000, balance: 357000 },
    { month: 'مايو', income: 140000, expenses: 95000, balance: 402000 },
    { month: 'يونيو', income: 130000, expenses: 91000, balance: 441000 }
  ];

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const monthlyChange = ((currentMonth.balance - previousMonth.balance) / previousMonth.balance) * 100;

  if (!isVisible) {
    return (
      <Card className="w-16 h-16 fixed right-4 top-1/2 transform -translate-y-1/2 cursor-pointer hover:shadow-lg transition-all">
        <CardContent className="p-0 flex items-center justify-center h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(true)}
            className="w-full h-full"
          >
            <CreditCard className="h-6 w-6" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      {/* Header with toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" />
              ملخص الحسابات البنكية
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Total Balance Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">إجمالي الرصيد</div>
            <div className="text-3xl font-bold text-blue-700">
              {formatCurrencyEnglish(totalBalance)}
            </div>
            <div className="flex items-center justify-center gap-2">
              {monthlyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(monthlyChange).toFixed(1)}% هذا الشهر
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">الحسابات البنكية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedAccount === account.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{account.bankName}</div>
                    <div className="text-xs text-muted-foreground">{account.accountNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {formatCurrencyEnglish(account.balance)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {account.type === 'business' ? 'تجاري' : 
                     account.type === 'savings' ? 'توفير' : 'جاري'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monthly Financial Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة مالية شهرية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">الدخل</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrencyEnglish(currentMonth.income)}
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-red-600 font-medium">المصروفات</div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrencyEnglish(currentMonth.expenses)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>صافي التدفق النقدي</span>
              <span className="font-bold">
                {formatCurrencyEnglish(currentMonth.income - currentMonth.expenses)}
              </span>
            </div>
            <Progress 
              value={(currentMonth.income / (currentMonth.income + currentMonth.expenses)) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" />
            رفع ملفات مصرفية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground mb-2">
              اسحب وأفلت ملفات Excel أو PDF هنا
            </div>
            <Button variant="outline" size="sm">
              اختر ملفات
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            الملفات المدعومة: .xlsx, .xls, .pdf (حد أقصى 10MB)
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              تقرير مفصل
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              تحليل الاتجاهات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}