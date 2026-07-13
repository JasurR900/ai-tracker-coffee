'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { colors } from '@/theme/theme';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MacroIcon } from '@/components/ui/MacroIcon';

interface CaloriesCardProps {
  remaining: number;
  /** 0..1 share of the goal already consumed */
  progress: number;
}

export function CaloriesCard({ remaining, progress }: CaloriesCardProps) {
  return (
    <Paper
      sx={{
        mx: 2.5,
        mt: 2.5,
        borderRadius: '20px',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 44, fontWeight: 800, color: colors.heading, lineHeight: 1 }}>
          {remaining}
        </Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary', mt: 1 }}>
          Осталось калорий
        </Typography>
      </Box>
      <ProgressRing
        size={110}
        strokeWidth={11}
        progress={Math.max(progress, 0.03)}
        color={colors.orange}
        trackColor="#F1F1F4"
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            bgcolor: colors.orange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(249, 76, 16, 0.35)',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.5 2s.8 2.6-1.3 5.2C10.2 9.7 8 10.9 8 14a4.5 4.5 0 0 0 9 .3c.2-2.4-1-4.6-.4-6.8.4-1.6 1.4-2.5 1.4-2.5S20 7.5 20 12a8 8 0 1 1-16 0c0-3.1 1.7-5.6 3.6-7.6C9.7 2.2 13.5 2 13.5 2Z"
              fill="#fff"
            />
          </svg>
        </Box>
      </ProgressRing>
    </Paper>
  );
}

interface MacroCardProps {
  status: string;
  value: number;
  label: string;
  kind: 'protein' | 'carbs' | 'fats';
  /** 0..1 */
  progress: number;
}

export function MacroCard({ status, value, label, kind, progress }: MacroCardProps) {
  const ringColor = kind === 'protein' ? colors.protein : kind === 'carbs' ? colors.carbs : colors.fats;
  return (
    <Paper
      sx={{
        flex: 1,
        borderRadius: '18px',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.25,
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 600 }}>
        {status}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: colors.heading }}>{value}g</Typography>
      <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 1 }}>{label}</Typography>
      <ProgressRing
        size={46}
        strokeWidth={5}
        progress={Math.max(progress, 0.02)}
        color={ringColor}
        trackColor="#F1F1F4"
      >
        <MacroIcon kind={kind} size={18} />
      </ProgressRing>
    </Paper>
  );
}
