'use client';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';

const MIN_KG = 30;
const MAX_KG = 200;

interface WeightSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function WeightSlider({ value, onChange }: WeightSliderProps) {
  return (
    <Box>
      <Slider
        value={value}
        min={MIN_KG}
        max={MAX_KG}
        step={0.5}
        onChange={(_e, v) => onChange(v as number)}
        aria-label="Вес"
        sx={{
          color: colors.orange,
          height: 6,
          '& .MuiSlider-rail': { bgcolor: '#E2E3EA', opacity: 1 },
          '& .MuiSlider-track': { bgcolor: '#E2E3EA', border: 'none', opacity: 0 },
          '& .MuiSlider-thumb': {
            width: 26,
            height: 26,
            bgcolor: colors.orange,
            border: '3px solid #fff',
            boxShadow: '0 3px 10px rgba(249, 76, 16, 0.4)',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: '0 3px 14px rgba(249, 76, 16, 0.5)',
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography sx={{ fontSize: 13, color: '#B9BCC8', fontWeight: 600 }}>{MIN_KG}kg</Typography>
        <Typography sx={{ fontSize: 13, color: '#B9BCC8', fontWeight: 600 }}>
          {Math.round((MIN_KG + MAX_KG) / 2)}kg
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#B9BCC8', fontWeight: 600 }}>{MAX_KG}kg</Typography>
      </Box>
    </Box>
  );
}
