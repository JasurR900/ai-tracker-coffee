'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AppShell } from '@/components/layout/AppShell';
import { BootLoader } from '@/components/layout/BootLoader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAppSelector } from '@/store/hooks';
import { navigate } from '@/lib/navigate';

export default function WelcomePage() {
  const router = useRouter();
  const onboardingCompleted = useAppSelector((s) => s.profile.onboardingCompleted);
  const plan = useAppSelector((s) => s.profile.plan);
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const authenticated = useAppSelector((s) => s.app.authenticated);

  const onboardingDone = onboardingCompleted || plan !== null;

  useEffect(() => {
    if (hydrated && authenticated) {
      navigate(router, onboardingDone ? '/dashboard' : '/onboarding/1', true);
    }
  }, [hydrated, authenticated, onboardingDone, router]);

  // Wait for JWT + profile hydrate, or while redirecting to home/onboarding.
  if (!hydrated || authenticated) {
    return <BootLoader label="Открываем трекер…" />;
  }

  const handleStart = () => {
    navigate(router, '/onboarding/1');
  };

  return (
    <AppShell>
      <Box
        sx={{
          pb: 2,
          pt: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          textAlign: 'center',
          bgcolor: '#FAFAFC',
          borderBottom: '1px solid #ECEDF2',
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary' }}>
          Счётчик калорий
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,120,160,0.18) 0%, transparent 70%)',
            top: '12%',
            left: -120,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,110,50,0.16) 0%, transparent 70%)',
            bottom: '5%',
            right: -140,
            pointerEvents: 'none',
          }}
        />

        <Typography
          variant="h1"
          sx={{ textAlign: 'center', fontSize: 28, mb: 1.5, position: 'relative' }}
        >
          Следите за своим
          <br />
          рационом
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: 16,
            mb: 4,
            position: 'relative',
          }}
        >
          Ваш персональный
          <br />
          нутрициолог на базе ИИ
        </Typography>
        <PrimaryButton onClick={handleStart} sx={{ position: 'relative' }}>
          Начать
        </PrimaryButton>
      </Box>
    </AppShell>
  );
}
