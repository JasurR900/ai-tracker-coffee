'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '@/theme/theme';
import { weekdayShort } from '@/lib/format';

/** Last 6 days + today; today is highlighted in a raised white pill. */
export function WeekStrip() {
  const days = useMemo(() => {
    const result: { label: string; day: number; isToday: boolean }[] = [];
    const now = new Date();
    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      result.push({ label: weekdayShort(d), day: d.getDate(), isToday: offset === 0 });
    }
    return result;
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 1, px: 2.5, mt: 2, alignItems: 'flex-start' }}>
      {days.map(({ label, day, isToday }) => (
        <Box
          key={`${label}-${day}`}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            ...(isToday && {
              bgcolor: '#fff',
              borderRadius: '14px',
              py: 1,
              mt: -1,
              boxShadow: '0 6px 18px rgba(23, 26, 78, 0.10)',
            }),
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: isToday ? colors.heading : '#B9BCC8',
            }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(isToday
                ? { bgcolor: colors.navy, color: '#fff' }
                : { border: '1.5px dashed #D3D5DE', color: '#B9BCC8' }),
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'inherit' }}>{day}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
