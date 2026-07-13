'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useAppSelector } from '@/store/hooks';

/** Height of the fixed header block (card + top offset), for content spacing. */
export const GREETING_HEADER_HEIGHT = 84;

function greetingByHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function GreetingHeader() {
  const router = useRouter();
  const greeting = greetingByHour(new Date().getHours());
  const username = useAppSelector((s) => s.app.username);
  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : 'друг';
  const initials = (username ?? '?').slice(0, 2).toUpperCase();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 30,
        px: 1,
        pt: 1,
      }}
    >
      <Box
        sx={{
          borderRadius: '24px',
          background: 'linear-gradient(100deg, #14165B 0%, #1D2380 55%, #2B39AC 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.5,
          py: 1.75,
          boxShadow: '0 10px 26px rgba(20, 22, 91, 0.35)',
        }}
      >
        {/* avatar + name → profile */}
        <ButtonBase
          onClick={() => router.push('/profile')}
          aria-label="Профиль"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            borderRadius: '18px',
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              flexShrink: 0,
              p: '2px',
              background: 'linear-gradient(135deg, #B389F0 0%, #FFFFFF 100%)',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                bgcolor: '#3D49B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>
                {initials}
              </Typography>
            </Box>
          </Box>
          <Typography
            noWrap
            sx={{ flex: 1, minWidth: 0, color: '#fff', fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}
          >
            {greeting}, {displayName}!
          </Typography>
        </ButtonBase>

        {/* notification bell */}
        <IconButton
          aria-label="Уведомления"
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            border: '1.5px solid rgba(255,255,255,0.35)',
            color: '#fff',
            position: 'relative',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 18 }} />
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              right: 8,
              width: 6.5,
              height: 6.5,
              borderRadius: '50%',
              bgcolor: '#F94C10',
              border: '1.5px solid #1D2380',
            }}
          />
        </IconButton>
      </Box>
    </Box>
  );
}
