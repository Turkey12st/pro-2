import React, { useState } from 'react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { OnboardingWizard } from './OnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';

interface OnboardingBannerProps {
  showWhenComplete?: boolean;
}

export function OnboardingBanner({ showWhenComplete = true }: OnboardingBannerProps) {
  const { steps, currentStep, isComplete, loading } = useOnboardingStatus();
  const [dismissed, setDismissed] = useState(false);

  // Don't show anything while loading
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // If complete and user doesn't want to see it, or dismissed
  if (isComplete && (!showWhenComplete || dismissed)) {
    return null;
  }

  // If not complete but dismissed (user chose to skip for now)
  if (dismissed && !isComplete) {
    return null;
  }

  return (
    <OnboardingWizard
      steps={steps}
      currentStep={currentStep}
      isComplete={isComplete}
      onDismiss={isComplete ? () => setDismissed(true) : undefined}
    />
  );
}
