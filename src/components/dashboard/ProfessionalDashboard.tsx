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
  Star,
  UserCheck,
  Building,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useDataIntegration } from '@/hooks/useDataIntegration';
import { useNavigate } from 'react-router-dom';
import { formatNumberEnglish, formatCurrencyEnglish, formatPercentageEnglish } from '@/utils/numberFormatter';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316'
};

interface ProfessionalDashboardProps {
  onKPIClick?: (kpiType: string) => void;
}

export function ProfessionalDashboard({ onKPIClick }: ProfessionalDashboardProps) {
  const { data, loading } = useDataIntegration();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate metrics
  const avgPerformance = data.employees.reduce((sum, emp) => {
    const perf = emp.employee_performance?.[0]?.performance_score || 0;
    return sum + perf;
  }, 0) / (data.employees.length || 1);

  const nps = Math.round(avgPerformance * 0.05); // Convert to NPS scale
  const activeProjects = data.projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = data.projects.filter(p => p.status === 'completed').length;
  const projectSuccessRate = data.projects.length > 0 ? (completedProjects / data.projects.length) * 100 : 0;
  
  const totalProjectsCost = data.projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const availableCapital = data.totalCapital - data.totalSalaries - totalProjectsCost;

  // Gender distribution (simulated)
  const genderData = [
    { name: 'ذكور', value: 55, color: COLORS.success },
    { name: 'إناث', value: 45, color: COLORS.pink }
  ];

  // Department distribution
  const departmentData = [
    { name: 'الإدارة', value: 25, color: COLORS.info },
    { name: 'المالية', value: 30, color: COLORS.success },
    { name: 'الموارد البشرية', value: 20, color: COLORS.warning },
    { name: 'التسويق', value: 25, color: COLORS.purple }
  ];

  // Performance categories
  const performanceData = [
    { category: 'ممتاز', count: Math.round(data.totalEmployees * 0.4), percentage: 40, emoji: '😊' },
    { category: 'جيد', count: Math.round(data.totalEmployees * 0.35), percentage: 35, emoji: '😐' },
    { category: 'متوسط', count: Math.round(data.totalEmployees * 0.25), percentage: 25, emoji: '😔' }
  ];

  // Monthly trends
  const monthlyData = [
    { month: 'يناير', revenue: 450000, expenses: 320000, projects: 12 },
    { month: 'فبراير', revenue: 520000, expenses: 380000, projects: 15 },
    { month: 'مارس', revenue: 480000, expenses: 350000, projects: 18 },
    { month: 'أبريل', revenue: 600000, expenses: 420000, projects: 22 },
    { month: 'مايو', revenue: 580000, expenses: 400000, projects: 25 },
    { month: 'يونيو', revenue: 650000, expenses: 450000, projects: 28 }
  ];

  // Radar chart data
  const radarData = [
    { subject: 'الكفاءة', A: avgPerformance, fullMark: 100 },
    { subject: 'الجودة', A: projectSuccessRate, fullMark: 100 },
    { subject: 'السرعة', A: 85, fullMark: 100 },
    { subject: 'التعاون', A: 78, fullMark: 100 },
    { subject: 'الابتكار', A: 82, fullMark: 100 },
    { subject: 'الالتزام', A: 90, fullMark: 100 }
  ];

  const handleKPIClick = (kpiId: string) => {
    if (onKPIClick) {
      onKPIClick(kpiId);
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
            لوحة التحليلات المتقدمة
          </h1>
          <p className="text-slate-300 mt-2">نظرة شاملة على أداء الشركة</p>
        </div>
        
        <div className="flex items-center gap-3">
          {['2022', '2023', '2024'].map(year => (
            <Button 
              key={year}
              variant={selectedPeriod === year ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(year)}
              className={selectedPeriod === year ? "bg-orange-500 hover:bg-orange-600" : "border-slate-600 text-slate-300"}
            >
              {year}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - KPIs */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* NPS Score */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                مؤشر الأداء العام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{nps}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
                  ))}
                </div>
                <p className="text-slate-400 text-sm">من 5 نجوم</p>
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm">توزيع الجنس</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-bold text-lg">{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 relative">
                <ResponsiveContainer width="100%" height={100}>
                  <RechartsPieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm">تقييم الأداء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((item, index) => (
                  <div key={item.category} className="text-center">
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="text-sm text-slate-400">{item.category}</div>
                    <div className="text-xl font-bold">{item.count}</div>
                    <div className="text-sm text-slate-500">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Main Charts */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Department Distribution */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Building className="h-5 w-5" />
                توزيع الموظفين حسب القسم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{data.totalEmployees}</div>
                    <div className="text-sm text-slate-400">إجمالي الموظفين</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {departmentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                الاتجاهات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }} 
                    />
                    <Bar dataKey="revenue" fill={COLORS.success} name="الإيرادات" />
                    <Bar dataKey="expenses" fill={COLORS.danger} name="المصروفات" />
                    <Bar dataKey="projects" fill={COLORS.info} name="المشاريع" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Metrics */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Radar Chart */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                التقييم العام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      domain={[0, 100]} 
                    />
                    <Radar 
                      name="الأداء" 
                      dataKey="A" 
                      stroke={COLORS.success} 
                      fill={COLORS.success} 
                      fillOpacity={0.3} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm">المؤشرات الرئيسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">إجمالي رأس المال</span>
                <span className="font-bold">{formatCurrencyEnglish(data.totalCapital)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">المشاريع النشطة</span>
                <span className="font-bold text-green-400">{activeProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">معدل النجاح</span>
                <span className="font-bold text-blue-400">{formatPercentageEnglish(projectSuccessRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">السيولة المتاحة</span>
                <span className={`font-bold ${availableCapital >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrencyEnglish(availableCapital)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-400 text-sm">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleKPIClick('hr')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                إدارة الموظفين
              </Button>
              <Button 
                onClick={() => handleKPIClick('projects')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                المشاريع
              </Button>
              <Button 
                onClick={() => handleKPIClick('financial')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                التقارير المالية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Alerts */}
      {(avgPerformance < 70 || availableCapital < 0 || projectSuccessRate < 50) && (
        <Card className="mt-6 bg-red-900/30 border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخاطر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {avgPerformance < 70 && (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  أداء الموظفين يحتاج تحسين ({formatPercentageEnglish(avgPerformance)})
                </div>
              )}
              {availableCapital < 0 && (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  تجاوز في رأس المال - مراجعة مطلوبة
                </div>
              )}
              {projectSuccessRate < 50 && (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  معدل نجاح المشاريع منخفض ({formatPercentageEnglish(projectSuccessRate)})
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}