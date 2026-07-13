'use client';

import { useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { colors } from '@/theme/theme';

const MIN_CM = 100;
const MAX_CM = 230;
const TICK_SPACING = 14; // px per cm
const RULER_HEIGHT = 120;

interface HeightRulerProps {
  value: number;
  onChange: (value: number) => void;
}

/** Horizontal scrollable ruler with a fixed orange center marker. */
export function HeightRuler({ value, onChange }: HeightRulerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isProgrammatic = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = (value - MIN_CM) * TICK_SPACING;
    if (Math.abs(el.scrollLeft - target) > TICK_SPACING / 2) {
      isProgrammatic.current = true;
      el.scrollLeft = target;
      requestAnimationFrame(() => {
        isProgrammatic.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    if (isProgrammatic.current) return;
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const cm = Math.round(el.scrollLeft / TICK_SPACING) + MIN_CM;
      const clamped = Math.min(MAX_CM, Math.max(MIN_CM, cm));
      if (clamped !== value) onChange(clamped);
    });
  }, [onChange, value]);

  const ticks = [];
  for (let cm = MIN_CM; cm <= MAX_CM; cm++) {
    const major = cm % 10 === 0;
    const mid = cm % 5 === 0 && !major;
    ticks.push(
      <Box
        key={cm}
        sx={{
          width: TICK_SPACING,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: major ? 2 : 1.5,
            height: major ? 56 : mid ? 40 : 26,
            bgcolor: major ? '#C2C5D1' : '#DCDEE6',
            borderRadius: 1,
          }}
        />
        {major && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              mt: -1.2,
              transform: 'translateY(-50%)',
              fontSize: 13,
              fontWeight: 600,
              color: '#B9BCC8',
              pointerEvents: 'none',
            }}
          >
            {cm}
          </Box>
        )}
      </Box>,
    );
  }

  return (
    <Box sx={{ position: 'relative', height: RULER_HEIGHT }}>
      <Box
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar"
        sx={{
          overflowX: 'auto',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          px: '50%',
        }}
      >
        {ticks}
      </Box>
      {/* center marker */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 8,
          bottom: 8,
          width: 3,
          transform: 'translateX(-50%)',
          bgcolor: colors.orange,
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
