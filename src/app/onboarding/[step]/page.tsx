'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AppShell } from '@/components/layout/AppShell';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StepProfile } from '@/components/onboarding/steps/StepProfile';
import { StepParams } from '@/components/onboarding/steps/StepParams';
import { StepWorkouts } from '@/components/onboarding/steps/StepWorkouts';
import { StepGoal } from '@/components/onboarding/steps/StepGoal';
import { StepDiet } from '@/components/onboarding/steps/StepDiet';
import { useAppSelector, useAppStore } from '@/store/hooks';
import { putProfile } from '@/lib/api/client';
import { useAuthGuard } from '@/lib/useAuthGuard';

const TOTAL_STEPS = 5;

export default function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step: stepParam } = use(params);
  const router = useRouter();
  useAuthGuard();
  const store = useAppStore();
  const profile = useAppSelector((s) => s.profile);

  const step = useMemo(() => {
    const n = Number(stepParam);
    return Number.isInteger(n) && n >= 1 && n <= TOTAL_STEPS ? n : 1;
  }, [stepParam]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return profile.gender !== null;
      case 2:
        return true;
      case 3:
        return profile.workouts !== null;
      case 4:
        return profile.goal !== null;
      case 5:
        return profile.diet !== null;
      default:
        return false;
    }
  }, [step, profile]);

  const handleBack = () => {
    if (step === 1) router.push('/');
    else router.push(`/onboarding/${step - 1}`);
  };

  const handleContinue = async () => {
    if (step < TOTAL_STEPS) {
      router.push(`/onboarding/${step + 1}`);
      return;
    }

    const { profile: currentProfile } = store.getState();
    await putProfile(currentProfile).catch(() => undefined);
    router.push('/processing');
  };

  return (
    <AppShell>
      <OnboardingHeader step={step} totalSteps={TOTAL_STEPS} onBack={handleBack} />
      <Box sx={{ px: 2.5, pt: 3, flex: 1 }}>
        {step === 1 && <StepProfile />}
        {step === 2 && <StepParams />}
        {step === 3 && <StepWorkouts />}
        {step === 4 && <StepGoal />}
        {step === 5 && <StepDiet />}
      </Box>
      <Box sx={{ px: 2.5, pt: 3, pb: 1 }}>
        <PrimaryButton
          onClick={handleContinue}
          disabled={!canContinue}
          endIcon={<ArrowForwardIcon />}
        >
          Продолжить
        </PrimaryButton>
      </Box>
    </AppShell>
  );
}
