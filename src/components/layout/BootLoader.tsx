'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';

export function BootLoader({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9997,
        bgcolor: '#FAFAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: colors.navy }} />
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}
