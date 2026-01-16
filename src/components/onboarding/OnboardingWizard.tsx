import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  BookOpen, 
  Users, 
  Check, 
  ChevronLeft,
  Rocket 
} from 'lucide-react';
import { OnboardingStep } from '@/hooks/useOnboardingStatus';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  currentStep: number;
  isComplete: boolean;
  onDismiss?: () => void;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  'company': Building2,
  'bank': CreditCard,
  'chart-of-accounts': BookOpen,
  'partners': Users,
};

export function OnboardingWizard({ 
  steps, 
  currentStep, 
  isComplete,
  onDismiss 
}: OnboardingWizardProps) {
  const navigate = useNavigate();
  
  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                تهانينا! تم إعداد حسابك بنجاح 🎉
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                يمكنك الآن البدء في استخدام جميع ميزات النظام
              </p>
            </div>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                إخفاء
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">مرحباً! لنبدأ بإعداد حسابك</CardTitle>
              <CardDescription>
                أكمل الخطوات التالية لتفعيل جميع ميزات النظام
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {completedSteps} / {steps.length} مكتملة
          </Badge>
        </div>
        
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid gap-3">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.id] || Building2;
            const isCurrentStep = index === currentStep;
            const isPreviousCompleted = index === 0 || steps[index - 1].completed;
            const canNavigate = step.completed || (isPreviousCompleted && !step.completed);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all",
                  step.completed && "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800",
                  isCurrentStep && !step.completed && "bg-primary/5 border-2 border-primary",
                  !step.completed && !isCurrentStep && "bg-muted/50 opacity-60"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  step.completed && "bg-green-100 dark:bg-green-900",
                  isCurrentStep && !step.completed && "bg-primary text-primary-foreground",
                  !step.completed && !isCurrentStep && "bg-muted"
                )}>
                  {step.completed ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className={cn(
                      "h-5 w-5",
                      isCurrentStep ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium",
                      step.completed && "text-green-700 dark:text-green-300",
                      isCurrentStep && !step.completed && "text-primary"
                    )}>
                      {step.title}
                    </span>
                    {step.completed && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                        مكتمل
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {step.description}
                  </p>
                </div>
                
                {canNavigate && (
                  <Button 
                    size="sm"
                    variant={isCurrentStep ? "default" : "ghost"}
                    onClick={() => navigate(step.route)}
                    className="shrink-0"
                  >
                    {step.completed ? 'عرض' : 'ابدأ'}
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
