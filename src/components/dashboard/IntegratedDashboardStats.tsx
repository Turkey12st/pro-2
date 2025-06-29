
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Building, 
  Briefcase, 
  TrendingUp, 
  Target,
  Award,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Activity,
  PieChart,
  BarChart3,
  TrendingDown,
  Zap,
  Shield
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';

interface IntegratedDashboardStatsProps {
  onStatClick?: (type: string) => void;
}

export function IntegratedDashboardStats({ onStatClick }: IntegratedDashboardStatsProps) {
  const { data, loading } = useDataIntegration();
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // حساب مؤشرات الأداء المتقدمة
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? 
    (completedProjects / data.projects.length) * 100 : 0;

  const totalProjectsCost = data.projects.reduce((sum, project) => 
    sum + (project.budget || 0), 0);

  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;
  const capitalUtilization = data.totalCapital > 0 ? 
    ((data.totalSalaries + totalProjectsCost) / data.totalCapital) * 100 : 0;

  // مؤشرات الأداء العالمية
  const employeeProductivity = avgPerformance * 1.2;
  const costEfficiencyRatio = data.totalCapital > 0 ? 
    ((data.totalCapital - (data.totalSalaries + totalProjectsCost)) / data.totalCapital) * 100 : 0;
  const projectROI = totalProjectsCost > 0 ? 
    ((completedProjects * 50000 - totalProjectsCost) / totalProjectsCost) * 100 : 0;
  const liquidityRatio = data.totalCapital > 0 ? 
    (availableCapital / (data.totalSalaries * 3)) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* المؤشرات الأساسية - تصميم محسن مع تدرجات ملونة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">إجمالي الموظفين</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{data.totalEmployees}</div>
            <p className="text-xs text-blue-600 mb-3">موظف نشط في النظام</p>
            <Progress value={75} className="mb-3 bg-blue-200" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs bg-white/50 hover:bg-white/80 text-blue-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الموظفين
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">إجمالي الرواتب</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">{data.totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-green-600 mb-1">ريال شهرياً</p>
            <div className="mb-3 text-xs">
              <span className="text-green-700 font-medium">+2.5%</span>
              <span className="text-green-600"> من الشهر الماضي</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs bg-white/50 hover:bg-white/80 text-green-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('employees')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة الرواتب
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">رأس المال</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">{data.totalCapital.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mb-2">ريال إجمالي</p>
            <Progress value={capitalUtilization} className="mb-2 bg-purple-200" />
            <div className="mb-2 text-xs text-purple-700">
              استخدام: {capitalUtilization.toFixed(1)}%
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs bg-white/50 hover:bg-white/80 text-purple-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('financial')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              التقارير المالية
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">المشاريع النشطة</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 mb-2">{activeProjects}</div>
            <p className="text-xs text-amber-600 mb-2">من إجمالي {data.totalProjects}</p>
            <Progress value={(activeProjects / Math.max(data.totalProjects, 1)) * 100} className="mb-2 bg-amber-200" />
            <div className="mb-2 text-xs text-amber-700">
              معدل النشاط: {((activeProjects / Math.max(data.totalProjects, 1)) * 100).toFixed(0)}%
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs bg-white/50 hover:bg-white/80 text-amber-700 opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => onStatClick?.('projects')}
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              إدارة المشاريع
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات الأداء المتقدمة - تصميم أنيق مع تفاعل بالضغط */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* مؤشر الأداء العام */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full"></div>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleCard('performance')}
          >
            <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg font-bold">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <span>مؤشر الأداء العام</span>
                <div className="text-xs font-normal text-indigo-600 mt-0.5">Key Performance Indicator</div>
              </div>
              <div className="transition-transform duration-200">
                {expandedCards['performance'] ? 
                  <ChevronDown className="h-5 w-5 text-indigo-600" /> : 
                  <ChevronRight className="h-5 w-5 text-indigo-600" />
                }
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-indigo-700 mb-3">{avgPerformance.toFixed(1)}%</div>
              <Progress value={avgPerformance} className="mb-3 bg-indigo-100 h-3" />
              <Badge variant={avgPerformance >= 85 ? 'default' : avgPerformance >= 70 ? 'secondary' : 'destructive'} 
                     className="text-sm px-3 py-1">
                {avgPerformance >= 85 ? 'أداء ممتاز' : avgPerformance >= 70 ? 'أداء جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
            
            {expandedCards['performance'] && (
              <div className="space-y-4 pt-4 border-t border-indigo-100 animate-fade-in">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">معامل الإنتاجية</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-700">{employeeProductivity.toFixed(1)}%</span>
                      <p className="text-xs text-gray-500">مؤشر الكفاءة العالمي</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">معدل الحضور</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-700">92%</span>
                      <p className="text-xs text-gray-500">متوسط شهري</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-700">رضا الموظفين</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-700">88%</span>
                      <p className="text-xs text-gray-500">آخر استطلاع</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Award className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-xs text-blue-800">
                      <strong>الفائدة التشغيلية:</strong> يساعد في تحديد نقاط القوة والضعف، ووضع خطط التطوير المهني وتحسين بيئة العمل
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معدل نجاح المشاريع */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full"></div>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleCard('projects')}
          >
            <CardTitle className="flex items-center gap-3 text-green-800 text-lg font-bold">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <span>معدل نجاح المشاريع</span>
                <div className="text-xs font-normal text-green-600 mt-0.5">Project Success Rate</div>
              </div>
              <div className="transition-transform duration-200">
                {expandedCards['projects'] ? 
                  <ChevronDown className="h-5 w-5 text-green-600" /> : 
                  <ChevronRight className="h-5 w-5 text-green-600" />
                }
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-green-700 mb-3">{projectSuccessRate.toFixed(1)}%</div>
              <Progress value={projectSuccessRate} className="mb-3 bg-green-100 h-3" />
              <div className="text-sm text-green-600 font-medium">
                {completedProjects} مكتمل من {data.totalProjects} مشروع
              </div>
            </div>
            
            {expandedCards['projects'] && (
              <div className="space-y-4 pt-4 border-t border-green-100 animate-fade-in">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">عائد الاستثمار</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${projectROI >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {projectROI.toFixed(1)}%
                      </span>
                      <p className="text-xs text-gray-500">ROI للمشاريع</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">مؤشر المخاطر</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-700">منخفض</span>
                      <p className="text-xs text-gray-500">تقييم المخاطر</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <PieChart className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-700">كفاءة التكلفة</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-700">{costEfficiencyRatio.toFixed(1)}%</span>
                      <p className="text-xs text-gray-500">نسبة التوفير</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green-100 rounded">
                      <Target className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-xs text-green-800">
                      <strong>الفائدة الإدارية:</strong> يقيس فعالية إدارة المشاريع ويساعد في تحسين عمليات التخطيط والتنفيذ وإدارة الموارد
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* السيولة المتاحة */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full"></div>
          <CardHeader 
            className="cursor-pointer pb-3"
            onClick={() => toggleCard('liquidity')}
          >
            <CardTitle className="flex items-center gap-3 text-purple-800 text-lg font-bold">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <span>السيولة المتاحة</span>
                <div className="text-xs font-normal text-purple-600 mt-0.5">Available Liquidity</div>
              </div>
              <div className="transition-transform duration-200">
                {expandedCards['liquidity'] ? 
                  <ChevronDown className="h-5 w-5 text-purple-600" /> : 
                  <ChevronRight className="h-5 w-5 text-purple-600" />
                }
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-purple-700 mb-3">{availableCapital.toLocaleString()}</div>
              <p className="text-sm text-purple-600 mb-3 font-medium">ريال متاح للاستثمار</p>
              <Progress value={Math.min(liquidityRatio, 100)} className="mb-3 bg-purple-100 h-3" />
              <Badge variant={liquidityRatio >= 100 ? 'default' : liquidityRatio >= 50 ? 'secondary' : 'destructive'}
                     className="text-sm px-3 py-1">
                {liquidityRatio >= 100 ? 'سيولة ممتازة' : liquidityRatio >= 50 ? 'سيولة جيدة' : 'سيولة منخفضة'}
              </Badge>
            </div>
            
            {expandedCards['liquidity'] && (
              <div className="space-y-4 pt-4 border-t border-purple-100 animate-fade-in">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">نسبة السيولة</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-700">{liquidityRatio.toFixed(1)}%</span>
                      <p className="text-xs text-gray-500">للـ 3 أشهر القادمة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">معدل الإنفاق</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-700">{((data.totalSalaries + totalProjectsCost) / data.totalCapital * 100).toFixed(1)}%</span>
                      <p className="text-xs text-gray-500">من رأس المال</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        {availableCapital >= 0 ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <span className="font-medium text-gray-700">الوضع المالي</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${availableCapital >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {availableCapital >= 0 ? 'مستقر' : 'يحتاج مراجعة'}
                      </span>
                      <p className="text-xs text-gray-500">التقييم الحالي</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-purple-100 rounded">
                      <Building className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-xs text-purple-800">
                      <strong>الفائدة المالية:</strong> يساعد في التخطيط المالي طويل المدى واتخاذ قرارات الاستثمار والتوسع بناءً على السيولة المتاحة
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* تنبيهات النظام المحسنة */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-800">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <span>تنبيهات مهمة تتطلب انتباه فوري</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800">أداء منخفض</p>
                    <p className="text-sm text-red-600">يحتاج تحسين عاجل في الأداء</p>
                  </div>
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800">تجاوز رأس المال</p>
                    <p className="text-sm text-red-600">مراجعة مالية مطلوبة فوراً</p>
                  </div>
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">معدل نجاح منخفض</p>
                    <p className="text-sm text-amber-600">مراجعة إدارة المشاريع</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
