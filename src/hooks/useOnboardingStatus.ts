import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
  order: number;
}

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  companyId: string | null;
  hasCompany: boolean;
  hasBankAccount: boolean;
  hasChartOfAccounts: boolean;
  hasPartners: boolean;
}

const DEFAULT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'company',
    title: 'تسجيل بيانات الشركة',
    description: 'أدخل المعلومات الأساسية للشركة مثل الاسم، السجل التجاري، والرقم الضريبي',
    route: '/company',
    order: 1,
  },
  {
    id: 'bank',
    title: 'إضافة الحساب البنكي',
    description: 'أضف معلومات الحساب البنكي للشركة لتفعيل العمليات المالية',
    route: '/bank-reconciliation',
    order: 2,
  },
  {
    id: 'chart-of-accounts',
    title: 'إعداد دليل الحسابات',
    description: 'قم بتهيئة شجرة الحسابات المحاسبية لبدء تسجيل القيود',
    route: '/accounting',
    order: 3,
  },
  {
    id: 'partners',
    title: 'إضافة الشركاء',
    description: 'سجل بيانات الشركاء ونسب ملكيتهم في رأس المال',
    route: '/partners',
    order: 4,
  },
];

export function useOnboardingStatus() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    isComplete: false,
    currentStep: 0,
    steps: [],
    companyId: null,
    hasCompany: false,
    hasBankAccount: false,
    hasChartOfAccounts: false,
    hasPartners: false,
  });
  const [loading, setLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. التحقق من وجود شركة مرتبطة بالمستخدم
      const { data: userCompany } = await supabase
        .from('users_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      const companyId = userCompany?.company_id || null;
      let hasCompany = false;
      let hasBankAccount = false;
      let hasChartOfAccounts = false;
      let hasPartners = false;

      if (companyId) {
        // 2. التحقق من بيانات الشركة
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, cr_number')
          .eq('id', companyId)
          .maybeSingle();

        hasCompany = !!(company?.name && company?.cr_number);

        // 3. التحقق من الحساب البنكي
        const { count: bankCount } = await supabase
          .from('bank_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId);

        hasBankAccount = (bankCount || 0) > 0;

        // 4. التحقق من دليل الحسابات
        const { count: accountsCount } = await supabase
          .from('chart_of_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId);

        hasChartOfAccounts = (accountsCount || 0) > 0;

        // 5. التحقق من الشركاء
        const { count: partnersCount } = await supabase
          .from('company_partners')
          .select('name', { count: 'exact', head: true });

        hasPartners = (partnersCount || 0) > 0;
      }

      // تحديد حالة كل خطوة
      const completedMap: Record<string, boolean> = {
        'company': hasCompany,
        'bank': hasBankAccount,
        'chart-of-accounts': hasChartOfAccounts,
        'partners': hasPartners,
      };

      const steps: OnboardingStep[] = DEFAULT_STEPS.map((step) => ({
        ...step,
        completed: completedMap[step.id] || false,
      }));

      // تحديد الخطوة الحالية (أول خطوة غير مكتملة)
      const currentStepIndex = steps.findIndex((step) => !step.completed);
      const currentStep = currentStepIndex === -1 ? steps.length : currentStepIndex;
      const isComplete = steps.every((step) => step.completed);

      setStatus({
        isComplete,
        currentStep,
        steps,
        companyId,
        hasCompany,
        hasBankAccount,
        hasChartOfAccounts,
        hasPartners,
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    ...status,
    loading,
    refreshStatus: checkOnboardingStatus,
  };
}
