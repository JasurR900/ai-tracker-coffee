'use client';

import Box from '@mui/material/Box';
import { colors } from '@/theme/theme';
import { BottomNav, type FabVariant } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  fab?: FabVariant;
  activeTab?: 'home' | 'loyalty' | 'maps' | 'profile';
  withNav?: boolean;
  dark?: boolean;
}

export function AppShell({
  children,
  fab = 'upload',
  activeTab = 'home',
  withNav = true,
  dark = false,
}: AppShellProps) {
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
      <Box sx={{ flex: 1, pb: withNav ? '110px' : 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      {withNav && <BottomNav fab={fab} activeTab={activeTab} />}
    </Box>
  );
}
