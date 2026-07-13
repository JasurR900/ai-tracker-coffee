'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { AppShell } from '@/components/layout/AppShell';
import { GreetingHeader } from '@/components/dashboard/GreetingHeader';
import { WeekStrip } from '@/components/dashboard/WeekStrip';
import { CaloriesCard, MacroCard } from '@/components/dashboard/CaloriesCard';
import { MealCard, EmptyHistory } from '@/components/dashboard/MealCard';
import { useAppSelector } from '@/store/hooks';
import { isToday } from '@/lib/format';
import { colors } from '@/theme/theme';

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const plan = useAppSelector((s) => s.profile.plan);
  const onboardingCompleted = useAppSelector((s) => s.profile.onboardingCompleted);
  const meals = useAppSelector((s) => s.meals.items);

  useEffect(() => {
    if (hydrated && !onboardingCompleted) router.replace('/');
  }, [hydrated, onboardingCompleted, router]);

  const todayTotals = useMemo(() => {
    return meals
      .filter((m) => isToday(m.createdAt))
      .reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          fats: acc.fats + m.fats,
          carbs: acc.carbs + m.carbs,
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 },
      );
  }, [meals]);

  const goal = plan ?? { calories: 2000, protein: 150, carbs: 225, fats: 56 };
  const remaining = {
    calories: Math.max(0, goal.calories - todayTotals.calories),
    protein: Math.max(0, Math.round((goal.protein - todayTotals.protein) * 10) / 10),
    carbs: Math.max(0, Math.round((goal.carbs - todayTotals.carbs) * 10) / 10),
    fats: Math.max(0, Math.round((goal.fats - todayTotals.fats) * 10) / 10),
  };

  const macroCard = (kind: 'protein' | 'carbs' | 'fats', label: string) => {
    const left = remaining[kind];
    const done = left <= 0;
    return (
      <MacroCard
        kind={kind}
        status={done ? 'Выполнено !' : 'Осталось'}
        value={Math.round(left)}
        label={label}
        progress={goal[kind] > 0 ? Math.min(1, todayTotals[kind] / goal[kind]) : 0}
      />
    );
  };

  return (
    <AppShell scanFab>
      <GreetingHeader />
      <WeekStrip />
      <CaloriesCard
        remaining={remaining.calories}
        progress={goal.calories > 0 ? Math.min(1, todayTotals.calories / goal.calories) : 0}
      />
      <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, mt: 2 }}>
        {macroCard('protein', 'Белки')}
        {macroCard('carbs', 'Углеводы')}
        {macroCard('fats', 'Жиры')}
      </Box>

      <Typography variant="h3" sx={{ px: 2.5, mt: 3.5, mb: 1.5, fontSize: 21 }}>
        История загрузок
      </Typography>
      <Box sx={{ px: 2.5, pb: 2 }}>
        {meals.length === 0 ? (
          <EmptyHistory />
        ) : (
          <Stack spacing={1.5}>
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onClick={() => router.push(`/food/${meal.id}`)} />
            ))}
          </Stack>
        )}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => router.push('/onboarding/1')}
          sx={{
            mt: 2.5,
            py: 1.6,
            borderRadius: '14px',
            borderColor: colors.navy,
            color: colors.navy,
            fontWeight: 700,
            fontSize: 15.5,
            '&:hover': { borderColor: colors.navyDark, bgcolor: 'rgba(27,27,109,0.04)' },
          }}
        >
          Изменить параметры
        </Button>
      </Box>
    </AppShell>
  );
}
