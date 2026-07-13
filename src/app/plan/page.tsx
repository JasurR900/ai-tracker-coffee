'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import ButtonBase from '@mui/material/ButtonBase';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAutoTrackOrders } from '@/store/slices/profileSlice';

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
  const dispatch = useAppDispatch();
  const plan = useAppSelector((s) => s.profile.plan);
  const autoTrack = useAppSelector((s) => s.profile.autoTrackOrders);
  const hydrated = useAppSelector((s) => s.app.hydrated);

  useEffect(() => {
    if (hydrated && !plan) router.replace('/onboarding/1');
  }, [hydrated, plan, router]);

  if (!plan) return <AppShell withNav={false}>{null}</AppShell>;

  return (
    <AppShell fab="order" activeTab="home">
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

        <PrimaryButton onClick={() => router.push('/dashboard')} endIcon={<ArrowForwardIcon />}>
          Начать трекинг
        </PrimaryButton>

        <Button
          onClick={() => router.push('/onboarding/1')}
          sx={{ mt: 1.5, color: colors.heading, fontWeight: 700, fontSize: 15 }}
        >
          Изменить данные
        </Button>

        <ButtonBase
          onClick={() => dispatch(setAutoTrackOrders(!autoTrack))}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            gap: 1.5,
            mt: 2,
            mb: 1,
            px: 1,
            py: 1,
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13.5, color: '#B4B7C3' }}>
              Автоматически учитывать мои заказы из{' '}
              <Box component="span" sx={{ color: colors.navy, fontWeight: 700 }}>
                Point Coffee
              </Box>
            </Typography>
          </Box>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              flexShrink: 0,
              border: autoTrack ? 'none' : `2px solid ${colors.track}`,
              bgcolor: autoTrack ? colors.navy : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {autoTrack && <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />}
          </Box>
        </ButtonBase>
      </Box>
    </AppShell>
  );
}
