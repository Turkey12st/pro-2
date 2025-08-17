import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Award,
  AlertTriangle,
  Settings,
  Bell,
  Search,
  Calendar,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BarometerKPI } from './BarometerKPI';
import { BankSummaryPanel } from './BankSummaryPanel';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { useNavigate } from 'react-router-dom';
import { getCurrentDates } from '@/utils/dateHelpers';
import { formatNumberEnglish, formatCurrencyEnglish, formatPercentageEnglish } from '@/utils/numberFormatter';

interface ModernDashboardProps {
  onKPIClick?: (kpiType: string) => void;
}

export function ModernDashboard({ onKPIClick }: ModernDashboardProps) {
  const { data, loading } = useDataIntegration();
  const navigate = useNavigate();
  const { gregorian, hijri, time } = getCurrentDates();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? (completedProjects / data.projects.length) * 100 : 0;
  
  const totalProjectsCost = data.projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;
  const liquidityRatio = data.totalCapital > 0 ? (availableCapital / data.totalCapital) * 100 : 0;

  const kpis = [
    {
      id: 'performance',
      title: 'أداء الموظفين',
      value: avgPerformance,
      maxValue: 100,
      unit: '%',
      type: 'circular' as const,
      color: 'green' as const,
      thresholds: { low: 60, medium: 75, high: 85 },
      icon: <Users className="h-4 w-4" />,
      trend: avgPerformance > 75 ? 'up' as const : avgPerformance < 65 ? 'down' as const : 'stable' as const,
      trendValue: 5.2
    },
    {
      id: 'profit',
      title: 'هامش الربح',
      value: 23.5,
      maxValue: 100,
      unit: '%',
      type: 'speedometer' as const,
      color: 'blue' as const,
      thresholds: { low: 15, medium: 20, high: 25 },
      icon: <DollarSign className="h-4 w-4" />,
      trend: 'up' as const,
      trendValue: 2.8
    },
    {
      id: 'satisfaction',
      title: 'رضا العملاء',
      value: 87,
      maxValue: 100,
      unit: '%',
      type: 'thermometer' as const,
      color: 'orange' as const,
      thresholds: { low: 70, medium: 80, high: 90 },
      icon: <Target className="h-4 w-4" />,
      trend: 'stable' as const,
      trendValue: 0.5
    },
    {
      id: 'efficiency',
      title: 'الكفاءة التشغيلية',
      value: 78,
      maxValue: 100,
      unit: '%',
      type: 'radial' as const,
      color: 'purple' as const,
      thresholds: { low: 60, medium: 75, high: 85 },
      icon: <TrendingUp className="h-4 w-4" />,
      trend: 'up' as const,
      trendValue: 3.1
    },
    {
      id: 'projects',
      title: 'نجاح المشاريع',
      value: projectSuccessRate,
      maxValue: 100,
      unit: '%',
      type: 'circular' as const,
      color: 'green' as const,
      thresholds: { low: 60, medium: 75, high: 85 },
      icon: <Award className="h-4 w-4" />,
      trend: projectSuccessRate > 75 ? 'up' as const : 'down' as const,
      trendValue: 1.8
    },
    {
      id: 'cashflow',
      title: 'التدفق النقدي',
      value: liquidityRatio,
      maxValue: 100,
      unit: '%',
      type: 'speedometer' as const,
      color: 'blue' as const,
      thresholds: { low: 20, medium: 40, high: 60 },
      icon: <DollarSign className="h-4 w-4" />,
      trend: liquidityRatio > 40 ? 'up' as const : 'down' as const,
      trendValue: -2.3
    }
  ];

  const handleKPIClick = (kpiId: string) => {
    if (onKPIClick) {
      onKPIClick(kpiId);
    }
    
    // Navigate to relevant pages
    switch (kpiId) {
      case 'performance':
      case 'projects':
        navigate('/hr');
        break;
      case 'profit':
      case 'cashflow':
        navigate('/financial');
        break;
      case 'satisfaction':
        navigate('/projects');
        break;
      case 'efficiency':
        navigate('/settings');
        break;
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background overflow-auto p-6' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            لوحة التحكم الذكية
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{gregorian}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main KPIs Area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Primary KPIs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <BarometerKPI
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                maxValue={kpi.maxValue}
                unit={kpi.unit}
                type={kpi.type}
                color={kpi.color}
                thresholds={kpi.thresholds}
                icon={kpi.icon}
                trend={kpi.trend}
                trendValue={kpi.trendValue}
                onClick={() => handleKPIClick(kpi.id)}
              />
            ))}
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">إجمالي الموظفين</p>
                    <p className="text-2xl font-bold text-blue-700">{formatNumberEnglish(data.totalEmployees)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">رأس المال</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrencyEnglish(data.totalCapital)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">المشاريع النشطة</p>
                    <p className="text-2xl font-bold text-purple-700">{formatNumberEnglish(activeProjects)}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">السيولة المتاحة</p>
                    <p className="text-2xl font-bold text-orange-700">{formatCurrencyEnglish(availableCapital)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Alerts */}
          {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  تنبيهات المخاطر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {avgPerformance < 70 && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      أداء الموظفين يحتاج تحسين عاجل ({formatPercentageEnglish(avgPerformance)})
                    </div>
                  )}
                  {availableCapital < 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      تجاوز في رأس المال - مراجعة مالية مطلوبة
                    </div>
                  )}
                  {projectSuccessRate < 50 && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      معدل نجاح المشاريع منخفض ({formatPercentageEnglish(projectSuccessRate)})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Bank Summary */}
        <div className="xl:col-span-1">
          <BankSummaryPanel />
        </div>
      </div>
    </div>
  );
}