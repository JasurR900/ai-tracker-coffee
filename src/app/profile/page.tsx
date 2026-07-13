'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TuneIcon from '@mui/icons-material/Tune';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetProfile } from '@/store/slices/profileSlice';
import { clearMeals } from '@/store/slices/mealsSlice';
import { getAge } from '@/lib/nutrition';
import { colors } from '@/theme/theme';
import { getSupabase } from '@/lib/supabase/client';
import { deleteMeals, deleteProfile } from '@/lib/supabase/db';
import { useAuthGuard } from '@/lib/useAuthGuard';

const GOAL_LABELS = { lose: 'Снижение веса', maintain: 'Поддерживать вес', gain: 'Набрать массу' };
const DIET_LABELS = {
  classic: 'Полноценное питание',
  vegan: 'Веган',
  keto: 'Кетогенная диета',
  paleo: 'Палеодиета',
};

export default function ProfilePage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile);
  const userId = useAppSelector((s) => s.app.userId);
  const username = useAppSelector((s) => s.app.username);

  const handleReset = async () => {
    if (userId) {
      await Promise.all([deleteMeals(userId), deleteProfile(userId)]).catch(() => undefined);
    }
    dispatch(resetProfile());
    dispatch(clearMeals());
    router.push('/onboarding/1');
  };

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    router.push('/auth');
  };

  const rows: Array<[string, string]> = [
    ['Пол', profile.gender === 'male' ? 'Мужской' : profile.gender === 'female' ? 'Женский' : '—'],
    ['Возраст', profile.gender ? `${getAge(profile.birthDate)}` : '—'],
    ['Рост', `${profile.heightCm} см`],
    ['Вес', `${profile.weightKg.toFixed(1)} кг`],
    ['Цель', profile.goal ? GOAL_LABELS[profile.goal] : '—'],
    ['Диета', profile.diet ? DIET_LABELS[profile.diet] : '—'],
  ];

  return (
    <AppShell>
      <PageHeader title="Профиль" onBack={() => router.push('/dashboard')} elevated />

      <Box sx={{ px: 2.5, pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              bgcolor: colors.selectedBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 44, color: colors.navy }} />
          </Box>
          <Typography sx={{ mt: 1.5, fontSize: 19, fontWeight: 800, color: colors.heading }}>
            Мой профиль
          </Typography>
          {username && (
            <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.5 }}>
              @{username}
            </Typography>
          )}
          {profile.plan && (
            <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25 }}>
              Дневная цель: {profile.plan.calories} калорий
            </Typography>
          )}
        </Box>

        <Paper sx={{ borderRadius: '18px', px: 2.5, py: 1 }}>
          {rows.map(([label, value], i) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < rows.length - 1 ? `1px solid ${colors.divider}` : 'none',
              }}
            >
              <Typography sx={{ fontSize: 14.5, color: 'text.secondary' }}>{label}</Typography>
              <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: colors.heading }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2.5 }}>
          <ButtonBase
            onClick={() => router.push('/premium')}
            sx={{
              width: '100%',
              borderRadius: '16px',
              bgcolor: '#fff',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(23, 26, 78, 0.05)',
            }}
          >
            <WorkspacePremiumIcon sx={{ color: colors.orangeDeep }} />
            <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 15.5, color: colors.heading }}>
              Premium Доступ
            </Typography>
            <ChevronRightIcon sx={{ color: '#9C9FAD' }} />
          </ButtonBase>
          <ButtonBase
            onClick={() => router.push('/onboarding/1')}
            sx={{
              width: '100%',
              borderRadius: '16px',
              bgcolor: '#fff',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(23, 26, 78, 0.05)',
            }}
          >
            <TuneIcon sx={{ color: colors.navy }} />
            <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 15.5, color: colors.heading }}>
              Изменить параметры
            </Typography>
            <ChevronRightIcon sx={{ color: '#9C9FAD' }} />
          </ButtonBase>
          <ButtonBase
            onClick={handleLogout}
            sx={{
              width: '100%',
              borderRadius: '16px',
              bgcolor: '#fff',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(23, 26, 78, 0.05)',
            }}
          >
            <LogoutIcon sx={{ color: '#C64A5B' }} />
            <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 15.5, color: colors.heading }}>
              Выйти из аккаунта
            </Typography>
            <ChevronRightIcon sx={{ color: '#9C9FAD' }} />
          </ButtonBase>
        </Box>

        <Button
          fullWidth
          onClick={handleReset}
          sx={{ mt: 3, color: '#C64A5B', fontWeight: 700, fontSize: 14.5 }}
        >
          Сбросить все данные
        </Button>
      </Box>
    </AppShell>
  );
}
