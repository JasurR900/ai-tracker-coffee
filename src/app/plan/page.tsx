'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import { setPlan } from '@/store/slices/profileSlice';
import { putProfile } from '@/lib/api/client';
import { navigate } from '@/lib/navigate';
import { useAuthGuard } from '@/lib/useAuthGuard';

function MacroValue({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: '#5A5D6E' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 800, color: colors.navy, mt: 0.5 }}>
        {value}
        <Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: '#9C9FAD' }}>
          g
        </Box>
      </Typography>
    </Box>
  );
}

export default function PlanPage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const plan = useAppSelector((s) => s.profile.plan);
  const hydrated = useAppSelector((s) => s.app.hydrated);

  const handleStartTracking = async () => {
    if (!plan) return;
    dispatch(setPlan(plan));
    const { profile } = store.getState();
    await putProfile(profile).catch(() => undefined);
    navigate(router, '/dashboard');
  };

  useEffect(() => {
    if (hydrated && !plan) router.replace('/onboarding/1');
  }, [hydrated, plan, router]);

  if (!plan) return <AppShell>{null}</AppShell>;

  return (
    <AppShell>
      <PageHeader title="Счётчик калорий" onClose={() => router.push('/dashboard')} />

      <Box sx={{ px: 2.5, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h1" sx={{ textAlign: 'center', fontSize: 27, lineHeight: 1.25 }}>
          Ваш персональный
          <br />
          план готов !
        </Typography>
        <Typography
          sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 14.5, mt: 1.5, mb: 3, lineHeight: 1.5 }}
        >
          Наш ИИ рассчитал ваши идеальные нормы на день на основе ваших привычек приготовления и
          данных метаболизма.
        </Typography>

        <Paper
          sx={{
            borderRadius: '20px',
            p: 3,
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 55%, rgba(252, 226, 214, 0.55) 100%)',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: '#5A5D6E',
            }}
          >
            ДНЕВНАЯ ЦЕЛЬ
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
            <Typography sx={{ fontSize: 52, fontWeight: 800, color: colors.navy, lineHeight: 1 }}>
              {plan.calories}
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#8E92A3' }}>калорий</Typography>
          </Box>
          <Box sx={{ display: 'flex', mt: 3, '& > div + div': { borderLeft: '1px solid #ECEDF2' } }}>
            <MacroValue label="БЕЛКИ" value={plan.protein} />
            <MacroValue label="УГЛЕВОДЫ" value={plan.carbs} />
            <MacroValue label="ЖИРЫ" value={plan.fats} />
          </Box>
        </Paper>

        <Typography
          sx={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: colors.heading, mt: 4, mb: 2 }}
        >
          Готовы перейти на умный контроль калорий?
        </Typography>

        <PrimaryButton onClick={handleStartTracking} endIcon={<ArrowForwardIcon />}>
          Начать трекинг
        </PrimaryButton>

        <Button
          onClick={() => router.push('/onboarding/1')}
          sx={{ mt: 1.5, color: colors.heading, fontWeight: 700, fontSize: 15 }}
        >
          Изменить данные
        </Button>
      </Box>
    </AppShell>
  );
}
