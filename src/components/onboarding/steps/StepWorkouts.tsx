'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWorkouts } from '@/store/slices/profileSlice';
import { SelectCard } from '@/components/ui/SelectCard';
import { DotsIcon } from '@/components/ui/DotsIcon';

export function StepWorkouts() {
  const dispatch = useAppDispatch();
  const workouts = useAppSelector((s) => s.profile.workouts);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1, lineHeight: 1.25 }}>
        Сколько тренировок
        <br />в неделю вы делаете ?
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 2.5, lineHeight: 1.45 }}>
        Это будет использованно для настройки вашего персонального плана.
      </Typography>

      <Stack spacing={1.5}>
        <SelectCard
          icon={<DotsIcon variant="one" />}
          title="0-2"
          subtitle="Тренировки время от времени"
          selected={workouts === '0-2'}
          onClick={() => dispatch(setWorkouts('0-2'))}
        />
        <SelectCard
          icon={<DotsIcon variant="three" />}
          title="3-5"
          subtitle="Несколько тренировок в неделю"
          selected={workouts === '3-5'}
          onClick={() => dispatch(setWorkouts('3-5'))}
        />
        <SelectCard
          icon={<DotsIcon variant="nine" />}
          title="6+"
          subtitle="Я спортсмен"
          selected={workouts === '6+'}
          onClick={() => dispatch(setWorkouts('6+'))}
        />
      </Stack>
    </Box>
  );
}
