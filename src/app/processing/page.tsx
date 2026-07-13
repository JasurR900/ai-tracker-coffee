'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CheckIcon from '@mui/icons-material/Check';
import { AppShell } from '@/components/layout/AppShell';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPlan } from '@/store/slices/profileSlice';
import { calculatePlan } from '@/lib/nutrition';

const CHECK_ITEMS = ['Калории', 'Углеводы', 'Белки', 'Жиры', 'Оценка здоровья'];

export default function ProcessingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile);
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const [percent, setPercent] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile.gender || !profile.workouts || !profile.goal || !profile.diet) {
      router.replace('/onboarding/1');
      return;
    }

    const started = Date.now();
    const DURATION = 3200;
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setPercent(Math.min(99, Math.round(eased * 99)));
      if (t >= 1 && !finished.current) {
        finished.current = true;
        clearInterval(interval);
        dispatch(
          setPlan(
            calculatePlan({
              gender: profile.gender!,
              birthDate: profile.birthDate,
              heightCm: profile.heightCm,
              weightKg: profile.weightKg,
              workouts: profile.workouts!,
              goal: profile.goal!,
              diet: profile.diet!,
            }),
          ),
        );
        setTimeout(() => router.push('/plan'), 450);
      }
    }, 40);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const checkedCount = Math.floor((percent / 99) * CHECK_ITEMS.length);

  return (
    <AppShell>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 6,
        }}
      >
        <Typography sx={{ fontSize: 72, fontWeight: 800, color: colors.navy, lineHeight: 1 }}>
          {percent}%
        </Typography>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 800,
            color: colors.navy,
            textAlign: 'center',
            mt: 1.5,
            lineHeight: 1.3,
          }}
        >
          Мы настраиваем
          <br />
          всё для тебя
        </Typography>

        <Box
          sx={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            mt: 4,
            bgcolor: colors.track,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${percent}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${colors.orange} 0%, ${colors.navy} 100%)`,
              transition: 'width 0.1s linear',
            }}
          />
        </Box>

        <Typography sx={{ color: 'text.secondary', fontSize: 15, mt: 2.5 }}>
          Завершаю результаты...
        </Typography>

        <Paper sx={{ width: '100%', borderRadius: '20px', p: 3, mt: 4 }}>
          <Typography
            sx={{ fontSize: 16, fontWeight: 800, color: colors.navy, textAlign: 'center', mb: 2.5 }}
          >
            Ежедневная рекомендация для
          </Typography>
          {CHECK_ITEMS.map((item, i) => (
            <Box
              key={item}
              sx={{ display: 'flex', alignItems: 'center', py: 1.1, gap: 1.5 }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#B9BCC8' }} />
              <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 700, color: colors.navy }}>
                {item}
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: i < checkedCount ? '#0B0B14' : colors.track,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <CheckIcon sx={{ fontSize: 15, color: '#fff' }} />
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>
    </AppShell>
  );
}
