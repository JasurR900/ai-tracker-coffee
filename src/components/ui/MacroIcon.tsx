'use client';

export type MacroKind = 'protein' | 'carbs' | 'fats' | 'flame';

const COLORS: Record<MacroKind, string> = {
  protein: '#C64A5B',
  carbs: '#B07B4F',
  fats: '#7BB241',
  flame: '#F94C10',
};

/** Small food glyphs used inside macro rings: drumstick, wheat, avocado, flame. */
export function MacroIcon({ kind, size = 18 }: { kind: MacroKind; size?: number }) {
  const color = COLORS[kind];
  switch (kind) {
    case 'protein':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M15.5 3.5a5 5 0 0 0-7.07 7.07l1.42 1.42-4.6 4.6a2 2 0 1 0 2.16 2.16l4.6-4.6 1.42 1.42A5 5 0 0 0 20.5 8.5a5 5 0 0 0-5-5Z"
            fill={color}
          />
          <circle cx="5.6" cy="18.4" r="1.5" fill="#fff" opacity="0.5" />
        </svg>
      );
    case 'carbs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3v18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12 7c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Zm0 5c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Zm0 5c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Z"
            fill={color}
          />
        </svg>
      );
    case 'fats':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5c1.8 0 2.6 2.2 3.6 4.6 1 2.3 2.9 4 2.9 7.4a6.5 6.5 0 1 1-13 0c0-3.4 1.9-5.1 2.9-7.4 1-2.4 1.8-4.6 3.6-4.6Z"
            fill={color}
          />
          <circle cx="12" cy="14.5" r="3" fill="#5A8228" />
        </svg>
      );
    case 'flame':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M13.5 2s.8 2.6-1.3 5.2C10.2 9.7 8 10.9 8 14a4.5 4.5 0 0 0 9 .3c.2-2.4-1-4.6-.4-6.8.4-1.6 1.4-2.5 1.4-2.5S20 7.5 20 12a8 8 0 1 1-16 0c0-3.1 1.7-5.6 3.6-7.6C9.7 2.2 13.5 2 13.5 2Z"
            fill={color}
          />
        </svg>
      );
  }
}
