'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { colors } from '@/theme/theme';
import { MacroIcon } from '@/components/ui/MacroIcon';
import { formatMealTime } from '@/lib/format';
import type { Meal } from '@/types';

export function MealCard({ meal, onClick }: { meal: Meal; onClick: () => void }) {
  return (
    <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'left', borderRadius: '20px' }}>
      <Paper sx={{ width: '100%', borderRadius: '20px', overflow: 'hidden', display: 'flex' }}>
        <Box
          sx={{
            width: 116,
            alignSelf: 'stretch',
            flexShrink: 0,
            bgcolor: '#EEEFF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {meal.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meal.photo}
              alt={meal.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <RestaurantOutlinedIcon sx={{ color: '#C2C5D1', fontSize: 34 }} />
          )}
        </Box>
        <Box sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: colors.heading }} noWrap>
            {meal.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
            <MacroIcon kind="flame" size={16} />
            <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: colors.heading }}>
              {meal.calories} калорий
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
            {(
              [
                ['protein', meal.protein],
                ['fats', meal.fats],
                ['carbs', meal.carbs],
              ] as const
            ).map(([kind, value]) => (
              <Box key={kind} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MacroIcon kind={kind} size={14} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#5A5D6E' }}>
                  {value} g
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 1 }}>
            {formatMealTime(meal.createdAt)}
          </Typography>
        </Box>
      </Paper>
    </ButtonBase>
  );
}

export function EmptyHistory() {
  return (
    <Paper
      sx={{
        borderRadius: '20px',
        py: 5,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: '#EEEFF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RestaurantOutlinedIcon sx={{ fontSize: 40, color: '#C2C5D1' }} />
      </Box>
      <Typography sx={{ textAlign: 'center', color: '#5A5D6E', fontSize: 15, lineHeight: 1.5 }}>
        Нажмите +, чтобы добавить первый приём
        <br />
        пищи за день
      </Typography>
    </Paper>
  );
}
