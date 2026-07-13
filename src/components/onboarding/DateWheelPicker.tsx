'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import type { BirthDate } from '@/types';
import { WheelColumn, WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE_ITEMS } from './WheelColumn';

const MONTHS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

const MIN_YEAR = 1935;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => String(MIN_YEAR + i));

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DateWheelPickerProps {
  value: BirthDate;
  onChange: (value: BirthDate) => void;
}

export function DateWheelPicker({ value, onChange }: DateWheelPickerProps) {
  const dayCount = daysInMonth(value.year, value.month);
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => String(i + 1)),
    [dayCount],
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {/* highlight bar behind the selected row */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: (WHEEL_ITEM_HEIGHT * (WHEEL_VISIBLE_ITEMS - 1)) / 2,
          height: WHEEL_ITEM_HEIGHT,
          bgcolor: '#E9EAF0',
          borderRadius: '12px',
          zIndex: 0,
        }}
      />
      <Box sx={{ display: 'flex', position: 'relative' }}>
        <WheelColumn
          items={MONTHS}
          selectedIndex={value.month}
          onChange={(month) => {
            const maxDay = daysInMonth(value.year, month);
            onChange({ ...value, month, day: Math.min(value.day, maxDay) });
          }}
          align="left"
        />
        <WheelColumn
          items={days}
          selectedIndex={Math.min(value.day, dayCount) - 1}
          onChange={(i) => onChange({ ...value, day: i + 1 })}
        />
        <WheelColumn
          items={YEARS}
          selectedIndex={value.year - MIN_YEAR}
          onChange={(i) => {
            const year = MIN_YEAR + i;
            const maxDay = daysInMonth(year, value.month);
            onChange({ ...value, year, day: Math.min(value.day, maxDay) });
          }}
          align="right"
        />
      </Box>
    </Box>
  );
}
