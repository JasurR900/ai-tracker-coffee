'use client';

import { colors } from '@/theme/theme';

const PATTERNS: Record<'one' | 'three' | 'nine', Array<[number, number]>> = {
  one: [[12, 12]],
  three: [
    [12, 7],
    [7, 16],
    [17, 16],
  ],
  nine: [
    [6, 6],
    [12, 6],
    [18, 6],
    [6, 12],
    [12, 12],
    [18, 12],
    [6, 18],
    [12, 18],
    [18, 18],
  ],
};

export function DotsIcon({ variant }: { variant: 'one' | 'three' | 'nine' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      {PATTERNS[variant].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={variant === 'nine' ? 2 : 2.6} fill={colors.navy} />
      ))}
    </svg>
  );
}
