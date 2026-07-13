'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import AddIcon from '@mui/icons-material/Add';
import { colors } from '@/theme/theme';

interface AppShellProps {
  children: React.ReactNode;
  /** Show the floating "+" scan button at the bottom center. */
  scanFab?: boolean;
  dark?: boolean;
}

export function AppShell({ children, scanFab = false, dark = false }: AppShellProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        maxWidth: 430,
        mx: 'auto',
        minHeight: '100dvh',
        bgcolor: dark ? '#0A0A0F' : colors.bg,
        position: 'relative',
        boxShadow: { sm: '0 0 40px rgba(20, 20, 60, 0.12)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          pb: scanFab ? '104px' : 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      {scanFab && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 'max(env(safe-area-inset-bottom), 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <ButtonBase
            onClick={() => router.push('/scan')}
            aria-label="Загрузить еду"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: colors.orangeDeep,
              color: '#fff',
              border: '4px solid #fff',
              boxShadow: '0 8px 20px rgba(240, 78, 35, 0.4)',
              '&:hover': { bgcolor: colors.orange },
            }}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </ButtonBase>
        </Box>
      )}
    </Box>
  );
}
