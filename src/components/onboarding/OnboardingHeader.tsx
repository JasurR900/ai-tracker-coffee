'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { colors } from '@/theme/theme';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
}

export function OnboardingHeader({ step, totalSteps, onBack }: OnboardingHeaderProps) {
  return (
    <Box sx={{ px: 2.5, pt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mb: 2 }}>
        <IconButton onClick={onBack} sx={{ color: colors.heading, p: 0.5, ml: -0.5 }} aria-label="Назад">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 22,
            fontWeight: 800,
            color: colors.heading,
            whiteSpace: 'nowrap',
          }}
        >
          Счётчик калорий
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: 13.5, color: '#5A5D6E', fontWeight: 600 }}>
          Шаг {step} из {totalSteps}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: colors.heading }}>
          Настройки профиля
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, bgcolor: colors.track, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            borderRadius: 3,
            bgcolor: colors.orange,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}
