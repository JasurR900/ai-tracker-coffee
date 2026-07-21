'use client';

import { useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { colors } from '@/theme/theme';
import { weekdayShort } from '@/lib/format';

const DAYS_SHOWN = 14;

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface WeekStripProps {
  /** selected day key (see dateKey) */
  selected: string;
  onSelect: (key: string) => void;
}

/** Horizontally scrollable strip of the last 14 days; tap a day to view it. */
export function WeekStrip({ selected, onSelect }: WeekStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const result: { label: string; day: number; key: string; isToday: boolean }[] = [];
    const now = new Date();
    for (let offset = DAYS_SHOWN - 1; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      result.push({
        label: weekdayShort(d),
        day: d.getDate(),
        key: dateKey(d),
        isToday: offset === 0,
      });
    }
    return result;
  }, []);

  // start scrolled to today (rightmost)
  useEffect(() => {
    const scrollToEnd = () => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
    };
    scrollToEnd();
    const raf = requestAnimationFrame(scrollToEnd);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Box
      ref={scrollRef}
      className="no-scrollbar"
      sx={{
        display: 'flex',
        gap: 1,
        px: 2.5,
        pt: 'calc(max(env(safe-area-inset-top), 8px) + 12px)',
        overflowX: 'auto',
        alignItems: 'flex-start',
      }}
    >
      {days.map(({ label, day, key, isToday }) => {
        const active = key === selected;
        return (
          <ButtonBase
            key={key}
            onClick={() => onSelect(key)}
            sx={{
              flexShrink: 0,
              width: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.75,
              borderRadius: '14px',
              py: 1,
              ...(active && {
                bgcolor: '#fff',
                boxShadow: '0 6px 18px rgba(23, 26, 78, 0.10)',
              }),
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: active ? colors.heading : '#B9BCC8',
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
                ...(active
                  ? { bgcolor: colors.navy, color: '#fff' }
                  : isToday
                    ? { border: `1.5px solid ${colors.navy}`, color: colors.navy }
                    : { border: '1.5px dashed #D3D5DE', color: '#B9BCC8' }),
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'inherit' }}>{day}</Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
