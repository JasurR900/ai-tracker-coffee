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
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { AppShell } from '@/components/layout/AppShell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetProfile } from '@/store/slices/profileSlice';
import { clearMeals } from '@/store/slices/mealsSlice';
import { resetSubscription } from '@/store/slices/subscriptionSlice';
import { getAge } from '@/lib/nutrition';
import { colors } from '@/theme/theme';
import { deleteAllMeals, deleteProfile } from '@/lib/api/client';
import { formatPhoneDisplay } from '@/lib/formatPhone';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { openExternalUrl } from '@/lib/nativeBridge';

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
  const subscriptionActive = useAppSelector((s) => s.subscription.subscriptionActive);
  const userName = useAppSelector((s) => s.app.userName);
  const userPhone = useAppSelector((s) => s.app.userPhone);
  const userAvatarUrl = useAppSelector((s) => s.app.userAvatarUrl);
  const displayName = userName || 'Мой профиль';
  const displayPhone = formatPhoneDisplay(userPhone);

  const handleReset = async () => {
    await Promise.all([deleteAllMeals(), deleteProfile()]).catch(() => undefined);
    dispatch(resetProfile());
    dispatch(clearMeals());
    dispatch(resetSubscription());
    router.push('/onboarding/1');
  };

  const rows: Array<[string, string]> = [
    ['Пол', profile.gender === 'male' ? 'Мужской' : profile.gender === 'female' ? 'Женский' : '—'],
    ['Возраст', profile.gender ? `${getAge(profile.birthDate)}` : '—'],
    ['Рост', `${profile.heightCm} см`],
    ['Вес', `${profile.weightKg.toFixed(1)} кг`],
    ['Цель', profile.goal ? GOAL_LABELS[profile.goal] : '—'],
    ['Диета', profile.diet ? DIET_LABELS[profile.diet] : '—'],
  ];

  const menuCard = (
    icon: React.ReactNode,
    title: string,
    onClick: () => void,
    subtitle?: string,
  ) => (
    <ButtonBase
      onClick={onClick}
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
      {icon}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: colors.heading }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <ChevronRightIcon sx={{ color: '#9C9FAD' }} />
    </ButtonBase>
  );

  return (
    <AppShell scanFab>
      <Box sx={{ px: 2.5, pt: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
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
              overflow: 'hidden',
            }}
          >
            {userAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PersonIcon sx={{ fontSize: 44, color: colors.navy }} />
            )}
          </Box>
          <Typography sx={{ mt: 1.5, fontSize: 19, fontWeight: 800, color: colors.heading }}>
            {displayName}
          </Typography>
          {displayPhone ? (
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.35 }}>
              {displayPhone}
            </Typography>
          ) : null}
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
          {menuCard(
            <WorkspacePremiumIcon sx={{ color: colors.orangeDeep }} />,
            'Premium Доступ',
            () => router.push('/premium'),
          )}
          {menuCard(
            <CardMembershipIcon sx={{ color: colors.navy }} />,
            'Статус подписки',
            () => router.push('/subscription'),
            subscriptionActive ? 'Активна' : 'Нет активной подписки',
          )}
          {menuCard(
            <ForumOutlinedIcon sx={{ color: colors.navy }} />,
            'Поддержка',
            () => openExternalUrl('https://t.me/pointcoffeeuz'),
            'Напишите нам, если нужна помощь',
          )}
          {menuCard(
            <TuneIcon sx={{ color: colors.navy }} />,
            'Изменить параметры',
            () => router.push('/onboarding/1'),
          )}
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
