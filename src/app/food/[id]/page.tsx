'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import { AppShell } from '@/components/layout/AppShell';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/theme';
import { useAuthGuard } from '@/lib/useAuthGuard';

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center', px: 0.5 }}>
      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 15.5, whiteSpace: 'nowrap' }}>
        {value}
      </Typography>
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 0.8,
          mt: 0.25,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { ready } = useAuthGuard();
  const meal = useAppSelector((s) => s.meals.items.find((m) => m.id === id));

  useEffect(() => {
    if (ready && !meal) router.replace('/dashboard');
  }, [ready, meal, router]);

  if (!meal) return <AppShell>{null}</AppShell>;

  return (
    <AppShell scanFab>
      {/* photo hero */}
      <Box sx={{ position: 'relative', height: 360, bgcolor: '#E9EAF0', flexShrink: 0 }}>
        {meal.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meal.photo}
            alt={meal.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RestaurantOutlinedIcon sx={{ fontSize: 72, color: '#C2C5D1' }} />
          </Box>
        )}
        <IconButton
          onClick={() => router.push('/dashboard')}
          aria-label="Назад"
          sx={{
            position: 'absolute',
            top: 16,
            left: 12,
            color: colors.heading,
            bgcolor: 'rgba(255,255,255,0.85)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* content sheet */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '28px 28px 0 0',
          mt: -3.5,
          position: 'relative',
          flex: 1,
          px: 2.5,
          pt: 3.5,
          pb: 3,
          boxShadow: '0 -10px 30px rgba(23, 26, 78, 0.08)',
        }}
      >
        <Typography variant="h2" sx={{ fontSize: 24, mb: 2.5 }}>
          {meal.name}
        </Typography>

        <Box
          sx={{
            bgcolor: colors.navy,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            py: 1.75,
            px: 1,
            '& > div + div': { borderLeft: '1px solid rgba(255,255,255,0.18)' },
          }}
        >
          <StatCell value={`${meal.calories} ккал`} label="ЭНЕРГИЯ" />
          <StatCell value={`${meal.protein} г`} label="БЕЛКИ" />
          <StatCell value={`${meal.fats} г`} label="ЖИРЫ" />
          <StatCell value={`${meal.carbs} г`} label="УГЛЕВОДЫ" />
        </Box>

        <Typography
          sx={{ mt: 2.5, fontSize: 15.5, lineHeight: 1.65, color: '#9C9FAD', fontWeight: 500 }}
        >
          {meal.description}
        </Typography>
      </Box>
    </AppShell>
  );
}
