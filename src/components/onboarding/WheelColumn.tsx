'use client';

import { useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { colors } from '@/theme/theme';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;

interface WheelColumnProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  align?: 'left' | 'center' | 'right';
}

/** One column of an iOS-style wheel picker, built on scroll-snap. */
export function WheelColumn({ items, selectedIndex, onChange, align = 'center' }: WheelColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammatic = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = selectedIndex * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) {
      isProgrammatic.current = true;
      el.scrollTo({ top: target, behavior: 'auto' });
      requestAnimationFrame(() => {
        isProgrammatic.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, items.length]);

  const handleScroll = useCallback(() => {
    if (isProgrammatic.current) return;
    const el = ref.current;
    if (!el) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const index = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)));
      if (index !== selectedIndex) onChange(index);
    }, 90);
  }, [items.length, onChange, selectedIndex]);

  const pad = (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2;

  return (
    <Box
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar"
      sx={{
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        flex: 1,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Box sx={{ height: pad }} />
      {items.map((item, i) => {
        const distance = Math.abs(i - selectedIndex);
        return (
          <Box
            key={`${item}-${i}`}
            onClick={() => onChange(i)}
            sx={{
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
              scrollSnapAlign: 'center',
              fontSize: distance === 0 ? 20 : 19,
              fontWeight: distance === 0 ? 800 : 600,
              color:
                distance === 0
                  ? colors.heading
                  : distance === 1
                    ? '#B9BCC8'
                    : '#D3D5DE',
              cursor: 'pointer',
              px: 1.5,
              userSelect: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            {item}
          </Box>
        );
      })}
      <Box sx={{ height: pad }} />
    </Box>
  );
}

export const WHEEL_ITEM_HEIGHT = ITEM_HEIGHT;
export const WHEEL_VISIBLE_ITEMS = VISIBLE_ITEMS;
