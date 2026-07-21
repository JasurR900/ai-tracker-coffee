'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/theme';
import { BootLoader } from '@/components/layout/BootLoader';

/** Shown when the web app is opened without a JWT from the native WebView. */
export function NoTokenGate({ children }: { children: React.ReactNode }) {
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const noToken = useAppSelector((s) => s.app.noToken);

  if (!hydrated) return <BootLoader label="Открываем трекер…" />;
  if (!noToken) return <>{children}</>;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        bgcolor: '#FAFAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          bgcolor: colors.selectedBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PhoneIphoneIcon sx={{ fontSize: 44, color: colors.navy }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 22, color: colors.heading }}>
        Откройте в приложении Point Coffee
      </Typography>
      <Typography sx={{ fontSize: 15, color: 'text.secondary', maxWidth: 340, lineHeight: 1.5 }}>
        Счётчик калорий работает внутри мобильного приложения. Войдите в Point Coffee и откройте
        AI Calorie Tracker из профиля.
      </Typography>
    </Box>
  );
}
