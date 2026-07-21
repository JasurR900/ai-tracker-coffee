'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { AppShell } from '@/components/layout/AppShell';
import { GreetingHeader, GREETING_HEADER_HEIGHT } from '@/components/dashboard/GreetingHeader';
import { WeekStrip } from '@/components/dashboard/WeekStrip';
import { CaloriesCard, MacroCard } from '@/components/dashboard/CaloriesCard';
import { MealCard, EmptyHistory } from '@/components/dashboard/MealCard';
import { useAppSelector } from '@/store/hooks';
import { isToday } from '@/lib/format';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { colors } from '@/theme/theme';

export default function DashboardPage() {
  const router = useRouter();
  const { ready } = useAuthGuard();
  const plan = useAppSelector((s) => s.profile.plan);
  const onboardingCompleted = useAppSelector((s) => s.profile.onboardingCompleted);
  const meals = useAppSelector((s) => s.meals.items);

  useEffect(() => {
    if (ready && !onboardingCompleted) router.replace('/onboarding/1');
  }, [ready, onboardingCompleted, router]);

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

  const caloriesLeft = goal.calories - todayTotals.calories;
  const caloriesOver = caloriesLeft < 0;

  const macroCard = (kind: 'protein' | 'carbs' | 'fats', label: string) => {
    const left = Math.round(goal[kind] - todayTotals[kind]);
    const over = left < 0;
    const done = left === 0 && todayTotals[kind] > 0;
    return (
      <MacroCard
        kind={kind}
        status={over ? 'Сверх нормы !' : done ? 'Выполнено !' : 'Осталось'}
        value={Math.abs(left)}
        over={over}
        label={label}
        progress={goal[kind] > 0 ? Math.min(1, todayTotals[kind] / goal[kind]) : 0}
      />
    );
  };

  return (
    <AppShell scanFab>
      <GreetingHeader />
      <Box sx={{ height: GREETING_HEADER_HEIGHT }} />
      <WeekStrip />
      <CaloriesCard
        remaining={Math.abs(caloriesLeft)}
        over={caloriesOver}
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
