'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { colors } from '@/theme/theme';

interface ComingSoonProps {
  title: string;
  icon: React.ReactNode;
  activeTab: 'loyalty' | 'maps';
}

export function ComingSoon({ title, icon, activeTab }: ComingSoonProps) {
  return (
    <AppShell fab="upload" activeTab={activeTab}>
      <PageHeader title={title} elevated />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          px: 4,
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
            color: '#C2C5D1',
            fontSize: 42,
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 19, fontWeight: 800, color: colors.heading }}>
          Скоро будет доступно
        </Typography>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 14.5 }}>
          Этот раздел находится в разработке
        </Typography>
      </Box>
    </AppShell>
  );
}
