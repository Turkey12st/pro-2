import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BarometerKPIProps {
  title: string;
  value: number;
  maxValue: number;
  unit?: string;
  type: 'circular' | 'speedometer' | 'thermometer' | 'radial';
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  thresholds: {
    low: number;
    medium: number;
    high: number;
  };
  onClick?: () => void;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

export function BarometerKPI({
  title,
  value,
  maxValue,
  unit = '',
  type,
  color,
  thresholds,
  onClick,
  icon,
  trend,
  trendValue
}: BarometerKPIProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getPerformanceLevel = () => {
    if (percentage >= thresholds.high) return 'excellent';
    if (percentage >= thresholds.medium) return 'good';
    if (percentage >= thresholds.low) return 'medium';
    return 'low';
  };

  const performanceLevel = getPerformanceLevel();
  
  const getColorClasses = (level: string) => {
    const colors = {
      blue: {
        excellent: 'from-blue-500 to-blue-600 text-white',
        good: 'from-blue-400 to-blue-500 text-white',
        medium: 'from-blue-300 to-blue-400 text-blue-800',
        low: 'from-blue-100 to-blue-200 text-blue-600'
      },
      green: {
        excellent: 'from-green-500 to-green-600 text-white',
        good: 'from-green-400 to-green-500 text-white',
        medium: 'from-green-300 to-green-400 text-green-800',
        low: 'from-green-100 to-green-200 text-green-600'
      },
      orange: {
        excellent: 'from-orange-500 to-orange-600 text-white',
        good: 'from-orange-400 to-orange-500 text-white',
        medium: 'from-orange-300 to-orange-400 text-orange-800',
        low: 'from-orange-100 to-orange-200 text-orange-600'
      },
      red: {
        excellent: 'from-red-500 to-red-600 text-white',
        good: 'from-red-400 to-red-500 text-white',
        medium: 'from-red-300 to-red-400 text-red-800',
        low: 'from-red-100 to-red-200 text-red-600'
      },
      purple: {
        excellent: 'from-purple-500 to-purple-600 text-white',
        good: 'from-purple-400 to-purple-500 text-white',
        medium: 'from-purple-300 to-purple-400 text-purple-800',
        low: 'from-purple-100 to-purple-200 text-purple-600'
      }
    };
    return colors[color][level as keyof typeof colors[typeof color]];
  };

  const renderBarometer = () => {
    const colorClass = getColorClasses(performanceLevel);
    
    switch (type) {
      case 'circular':
        return (
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${percentage * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`stop-${color}-400`} />
                  <stop offset="100%" className={`stop-${color}-600`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{value.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{unit}</div>
              </div>
            </div>
          </div>
        );
        
      case 'speedometer':
        const angle = (percentage / 100) * 180 - 90;
        return (
          <div className="relative w-36 h-24 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                stroke="url(#speedometerGradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(percentage / 100) * 251} 251`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              {/* Needle */}
              <line
                x1="100"
                y1="80"
                x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
                y2={80 + 60 * Math.sin((angle * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="3"
                className={`text-${color}-600 transition-all duration-1000`}
                strokeLinecap="round"
              />
              <circle cx="100" cy="80" r="4" className={`fill-${color}-600`} />
              <defs>
                <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`stop-${color}-400`} />
                  <stop offset="100%" className={`stop-${color}-600`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="text-center">
                <div className="text-xl font-bold">{value.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">{unit}</div>
              </div>
            </div>
          </div>
        );
        
      case 'thermometer':
        return (
          <div className="relative w-16 h-32 mx-auto">
            <div className="w-8 h-28 bg-muted/20 rounded-full mx-auto relative overflow-hidden">
              <div 
                className={`absolute bottom-0 w-full bg-gradient-to-t ${colorClass} transition-all duration-1000 ease-out rounded-full`}
                style={{ height: `${percentage}%` }}
              />
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br border-4 border-background absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <span className="text-sm font-bold">{value.toFixed(0)}</span>
            </div>
          </div>
        );
        
      case 'radial':
        return (
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-full border-8 border-muted/20 relative overflow-hidden">
              <div 
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorClass} transition-all duration-1000 ease-out`}
                style={{
                  background: `conic-gradient(from 0deg, hsl(var(--${color})) 0%, hsl(var(--${color})) ${percentage}%, transparent ${percentage}%, transparent 100%)`
                }}
              />
              <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">{value.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{unit}</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer group",
        "hover:scale-105 hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <Badge variant={
              performanceLevel === 'excellent' ? 'default' :
              performanceLevel === 'good' ? 'secondary' :
              performanceLevel === 'medium' ? 'outline' : 'destructive'
            }>
              {performanceLevel === 'excellent' ? 'ممتاز' :
               performanceLevel === 'good' ? 'جيد' :
               performanceLevel === 'medium' ? 'متوسط' : 'ضعيف'}
            </Badge>
          </div>
          
          {/* Barometer */}
          <div className="py-4">
            {renderBarometer()}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">الهدف:</span>
              <span className="font-medium">{maxValue.toFixed(1)} {unit}</span>
            </div>
            {trend && trendValue && (
              <div className={cn(
                "flex items-center gap-1",
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                <span className="text-xs">
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </span>
                <span className="font-medium">{trendValue.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}