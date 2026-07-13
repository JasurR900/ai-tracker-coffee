'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setHeight, setWeight } from '@/store/slices/profileSlice';
import { HeightRuler } from '../HeightRuler';
import { WeightSlider } from '../WeightSlider';

export function StepParams() {
  const dispatch = useAppDispatch();
  const heightCm = useAppSelector((s) => s.profile.heightCm);
  const weightKg = useAppSelector((s) => s.profile.weightKg);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Внесите свои параметры
      </Typography>
      <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 3.5, lineHeight: 1.45 }}>
        Это помогает Calory Tracker настраивать ваш водный баланс и потребление энергии.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#5A5D6E' }}>
          РОСТ
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography sx={{ fontSize: 44, fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {heightCm}
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#9C9FAD' }}>cm</Typography>
        </Box>
      </Box>
      <HeightRuler value={heightCm} onChange={(v) => dispatch(setHeight(v))} />

      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 5, mb: 1 }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#5A5D6E' }}>
          ВЕС
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography sx={{ fontSize: 44, fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
            {weightKg.toFixed(1)}
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#9C9FAD' }}>kg</Typography>
        </Box>
      </Box>
      <WeightSlider value={weightKg} onChange={(v) => dispatch(setWeight(v))} />
    </Box>
  );
}
