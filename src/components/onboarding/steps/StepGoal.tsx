'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import BalanceIcon from '@mui/icons-material/Balance';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setGoal } from '@/store/slices/profileSlice';
import { SelectCard } from '@/components/ui/SelectCard';

export function StepGoal() {
  const dispatch = useAppDispatch();
  const goal = useAppSelector((s) => s.profile.goal);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Какая у вас цель ?
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 2.5, lineHeight: 1.45 }}>
        Мы подберем для вас точное количество калорий в зависимости от ваших ежедневных целей.
      </Typography>

      <Stack spacing={1.5}>
        <SelectCard
          icon={<InsertChartOutlinedIcon />}
          title="Снижение веса"
          subtitle="Сжигайте жир с точным дефицитом калорий."
          selected={goal === 'lose'}
          onClick={() => dispatch(setGoal('lose'))}
        />
        <SelectCard
          icon={<BalanceIcon />}
          title="Поддерживать вес"
          subtitle="Оптимизируйте расход энергии по самочувствию."
          selected={goal === 'maintain'}
          onClick={() => dispatch(setGoal('maintain'))}
        />
        <SelectCard
          icon={<FitnessCenterIcon />}
          title="Набрать массу"
          subtitle="Стимулируйте рост силы и сверхэффективность."
          selected={goal === 'gain'}
          onClick={() => dispatch(setGoal('gain'))}
        />
      </Stack>
    </Box>
  );
}
