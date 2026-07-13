'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { formatSum } from '@/lib/format';

const FEATURES = [
  { icon: CameraAltIcon, label: 'Безлимитный AI-сканер еды и напитков' },
  { icon: PieChartIcon, label: 'Анализ КБЖУ с точностью до грамма' },
  { icon: BarChartIcon, label: 'Расширенная статистика' },
  { icon: NotificationsActiveIcon, label: 'Умные напоминания' },
];

const PLANS = [
  { id: 'week', label: '1 неделя', price: 10000 },
  { id: 'month', label: '1 месяц', price: 25000, badge: 'ПОПУЛЯРНЫЙ ВЫБОР' as const },
  { id: 'quarter', label: '3 месяца', price: 75000 },
  { id: 'year', label: '12 месяцев', price: 200000, badge: 'ЛУЧШАЯ ЦЕНА' as const },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('month');

  return (
    <AppShell fab="upload" activeTab="home">
      <PageHeader title="Premium Access" onBack={() => router.back()} />

      <Box sx={{ px: 2.5, pt: 1 }}>
        {/* banner */}
        <Box
          sx={{
            borderRadius: '20px',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(120deg, #3F3F8F 0%, #8B8BC7 55%, #C9C9E8 100%)',
            minHeight: 170,
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>
            Premium Доступ
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14.5, mt: 0.75, maxWidth: 165 }}>
            Разблокируйте все возможности AI-трекера
          </Typography>
          {/* camera illustration */}
          <Box
            sx={{
              position: 'absolute',
              right: 18,
              bottom: 14,
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: '#F6E7C8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(20,20,60,0.25)',
            }}
          >
            <CameraAltIcon sx={{ fontSize: 42, color: '#2E2E6E' }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              right: 92,
              bottom: 62,
              bgcolor: '#fff',
              borderRadius: '10px',
              px: 1.5,
              py: 0.75,
              boxShadow: '0 6px 16px rgba(20,20,60,0.2)',
            }}
          >
            <Typography sx={{ fontSize: 10.5, color: '#8E92A3', fontWeight: 600 }}>Калории</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: colors.heading }}>
              390 Ккал
            </Typography>
          </Box>
        </Box>

        {/* features grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 2 }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <Paper key={label} sx={{ borderRadius: '16px', p: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#FEEDE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.25,
                }}
              >
                <Icon sx={{ fontSize: 21, color: colors.orangeDeep }} />
              </Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: colors.heading, lineHeight: 1.4 }}>
                {label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* plans */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
          {PLANS.map((plan) => {
            const isSelected = plan.id === selected;
            return (
              <Box key={plan.id} sx={{ position: 'relative' }}>
                {plan.badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -9,
                      right: 16,
                      zIndex: 1,
                      bgcolor: plan.badge === 'ЛУЧШАЯ ЦЕНА' ? colors.navy : colors.orangeDeep,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: '6px',
                    }}
                  >
                    {plan.badge}
                  </Box>
                )}
                <ButtonBase
                  onClick={() => setSelected(plan.id)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: '#fff',
                    border: `2px solid ${isSelected ? colors.orangeDeep : '#E8E9EF'}`,
                    textAlign: 'left',
                  }}
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: `2px solid ${isSelected ? colors.orangeDeep : '#C9CBD6'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Box
                        sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: colors.orangeDeep }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: colors.heading }}>
                    {plan.label}
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: colors.heading }}>
                    {formatSum(plan.price)}
                  </Typography>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>

        <PrimaryButton
          onClick={() => router.push('/checkout')}
          sx={{ mt: 3, mb: 1, letterSpacing: 1, fontSize: 16 }}
        >
          ПРОДОЛЖИТЬ
        </PrimaryButton>
      </Box>
    </AppShell>
  );
}
