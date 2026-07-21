'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { colors } from '@/theme/theme';
import { MacroIcon } from '@/components/ui/MacroIcon';
import { formatMealTime } from '@/lib/format';
import type { Meal } from '@/types';

const REVEAL_WIDTH = 76;

interface MealCardProps {
  meal: Meal;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Meal history card: tap to open, pencil to edit, swipe left to reveal delete. */
export function MealCard({ meal, onClick, onEdit, onDelete }: MealCardProps) {
  const [offset, setOffset] = useState(0);
  const dragStart = useRef<{ x: number; y: number; base: number } | null>(null);
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, base: offset };
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const start = dragStart.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 6 || Math.abs(dy) > Math.abs(dx)) return;
    moved.current = true;
    setOffset(Math.min(0, Math.max(-REVEAL_WIDTH, start.base + dx)));
  };

  const onPointerEnd = () => {
    if (!dragStart.current) return;
    dragStart.current = null;
    setOffset((current) => (current < -REVEAL_WIDTH / 2 ? -REVEAL_WIDTH : 0));
  };

  const handleCardClick = () => {
    if (moved.current) return;
    if (offset !== 0) {
      setOffset(0);
      return;
    }
    onClick();
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* delete action behind the card */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 1.5,
        }}
      >
        <IconButton
          onClick={() => {
            setOffset(0);
            onDelete();
          }}
          aria-label="Удалить блюдо"
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#FBE3E5',
            color: '#D14D5B',
            '&:hover': { bgcolor: '#F6CFD3' },
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>

      <Box
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerLeave={onPointerEnd}
        sx={{
          transform: `translateX(${offset}px)`,
          transition: dragStart.current ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
      >
        <ButtonBase
          onClick={handleCardClick}
          component="div"
          sx={{ width: '100%', textAlign: 'left', borderRadius: '20px' }}
        >
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
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <RestaurantOutlinedIcon sx={{ color: '#C2C5D1', fontSize: 34 }} />
              )}
            </Box>
            <Box sx={{ p: 2, flex: 1, minWidth: 0, position: 'relative' }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: colors.heading, pr: 4 }} noWrap>
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

              {/* edit shortcut */}
              <IconButton
                aria-label="Редактировать"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  width: 32,
                  height: 32,
                  bgcolor: '#EEEFF5',
                  color: colors.navy,
                  '&:hover': { bgcolor: '#E4E5EC' },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          </Paper>
        </ButtonBase>
      </Box>
    </Box>
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
