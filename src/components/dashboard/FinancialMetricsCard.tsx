import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity,
  Wallet,
  Target,
  CreditCard,
  RotateCcw,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { FinancialMetricsService, FinancialMetrics } from '@/services/financialMetrics';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyEnglish, formatPercentageEnglish, formatNumberEnglish } from '@/utils/numberFormatter';

export function FinancialMetricsCard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const calculatedMetrics = await FinancialMetricsService.calculateFinancialMetrics();
      setMetrics(calculatedMetrics);
      console.log('تم تحميل المؤشرات المالية:', calculatedMetrics);
    } catch (error) {
      console.error('خطأ في تحميل المؤشرات المالية:', error);
      toast({
        title: 'خطأ في تحميل المؤشرات المالية',
        description: 'حدث خطأ أثناء حساب المؤشرات المالية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري حساب المؤشرات المالية...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const getRatioStatus = (ratio: number, good: number, excellent: number) => {
    if (ratio >= excellent) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (ratio >= good) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { status: 'needs-improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="space-y-6">
      {/* العنوان والتحديث */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              المؤشرات المالية المتقدمة
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMetrics}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* نسب السيولة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            نسب السيولة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${getRatioStatus(metrics.liquidityRatios.currentRatio, 1.2, 2.0).bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">النسبة الجارية</span>
                <Badge variant="outline">{formatNumberEnglish(metrics.liquidityRatios.currentRatio)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">الأصول المتداولة ÷ الخصوم المتداولة</p>
              <div className={`text-xs mt-1 ${getRatioStatus(metrics.liquidityRatios.currentRatio, 1.2, 2.0).color}`}>
                {metrics.liquidityRatios.currentRatio >= 2.0 ? 'ممتاز' : 
                 metrics.liquidityRatios.currentRatio >= 1.2 ? 'جيد' : 'يحتاج تحسين'}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getRatioStatus(metrics.liquidityRatios.quickRatio, 1.0, 1.5).bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">النسبة السريعة</span>
                <Badge variant="outline">{formatNumberEnglish(metrics.liquidityRatios.quickRatio)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">(الأصول المتداولة - المخزون) ÷ الخصوم المتداولة</p>
              <div className={`text-xs mt-1 ${getRatioStatus(metrics.liquidityRatios.quickRatio, 1.0, 1.5).color}`}>
                {metrics.liquidityRatios.quickRatio >= 1.5 ? 'ممتاز' : 
                 metrics.liquidityRatios.quickRatio >= 1.0 ? 'جيد' : 'يحتاج تحسين'}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getRatioStatus(metrics.liquidityRatios.cashRatio, 0.2, 0.5).bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">النسبة النقدية</span>
                <Badge variant="outline">{formatNumberEnglish(metrics.liquidityRatios.cashRatio)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">النقدية ÷ الخصوم المتداولة</p>
              <div className={`text-xs mt-1 ${getRatioStatus(metrics.liquidityRatios.cashRatio, 0.2, 0.5).color}`}>
                {metrics.liquidityRatios.cashRatio >= 0.5 ? 'ممتاز' : 
                 metrics.liquidityRatios.cashRatio >= 0.2 ? 'جيد' : 'يحتاج تحسين'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نسب الربحية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            نسب الربحية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">هامش الربح الإجمالي</span>
                <Badge variant="outline">{formatPercentageEnglish(metrics.profitabilityRatios.grossProfitMargin)}</Badge>
              </div>
              <Progress value={Math.min(metrics.profitabilityRatios.grossProfitMargin, 100)} className="mb-2" />
              <p className="text-xs text-muted-foreground">الربح الإجمالي ÷ المبيعات × 100</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">هامش الربح الصافي</span>
                <Badge variant="outline">{formatPercentageEnglish(metrics.profitabilityRatios.netProfitMargin)}</Badge>
              </div>
              <Progress value={Math.min(metrics.profitabilityRatios.netProfitMargin, 100)} className="mb-2" />
              <p className="text-xs text-muted-foreground">صافي الربح ÷ المبيعات × 100</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">العائد على الاستثمار</span>
                <Badge variant="outline">{formatPercentageEnglish(metrics.profitabilityRatios.returnOnInvestment)}</Badge>
              </div>
              <Progress value={Math.min(metrics.profitabilityRatios.returnOnInvestment, 100)} className="mb-2" />
              <p className="text-xs text-muted-foreground">الدخل التشغيلي ÷ رأس المال × 100</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">العائد على الأصول</span>
                <Badge variant="outline">{formatPercentageEnglish(metrics.profitabilityRatios.returnOnAssets)}</Badge>
              </div>
              <Progress value={Math.min(metrics.profitabilityRatios.returnOnAssets, 100)} className="mb-2" />
              <p className="text-xs text-muted-foreground">صافي الربح ÷ إجمالي الأصول × 100</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">العائد على حقوق الملكية</span>
                <Badge variant="outline">{formatPercentageEnglish(metrics.profitabilityRatios.returnOnEquity)}</Badge>
              </div>
              <Progress value={Math.min(metrics.profitabilityRatios.returnOnEquity, 100)} className="mb-2" />
              <p className="text-xs text-muted-foreground">صافي الربح ÷ حقوق الملكية × 100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نسب النشاط والمديونية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              نسب النشاط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-sm font-medium">معدل دوران المخزون</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.activityRatios.inventoryTurnover)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-teal-50 rounded">
              <span className="text-sm font-medium">إجمالي دوران الأصول</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.activityRatios.assetTurnover)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded">
              <span className="text-sm font-medium">معدل دوران الذمم</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.activityRatios.receivablesTurnover)}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              نسب المديونية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm font-medium">نسبة الدين إلى حقوق الملكية</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.debtRatios.debtToEquity)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
              <span className="text-sm font-medium">نسبة الدين إلى الأصول</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.debtRatios.debtToAssets)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium">تغطية الفوائد</span>
              <Badge variant="outline">{formatNumberEnglish(metrics.debtRatios.interestCoverage)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المؤشرات النقدية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            المؤشرات النقدية الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatCurrencyEnglish(metrics.workingCapital)}
              </div>
              <p className="text-sm text-green-600 font-medium">رأس المال العامل</p>
              <p className="text-xs text-gray-600 mt-1">الأصول المتداولة - الخصوم المتداولة</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {formatCurrencyEnglish(metrics.operatingCashFlow)}
              </div>
              <p className="text-sm text-blue-600 font-medium">التدفق النقدي التشغيلي</p>
              <p className="text-xs text-gray-600 mt-1">النقد من العمليات التشغيلية</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700 mb-1">
                {formatCurrencyEnglish(metrics.netBankBalance)}
              </div>
              <p className="text-sm text-purple-600 font-medium">صافي رصيد البنك</p>
              <p className="text-xs text-gray-600 mt-1">الرصيد المتاح في البنوك</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}