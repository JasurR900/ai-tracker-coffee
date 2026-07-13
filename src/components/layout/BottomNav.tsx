'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import { colors } from '@/theme/theme';

export type FabVariant = 'order' | 'upload' | 'order-dark';

interface BottomNavProps {
  fab: FabVariant;
  activeTab: 'home' | 'loyalty' | 'maps' | 'profile';
}

const TABS = [
  { key: 'home', label: 'Главная', icon: HomeOutlinedIcon, href: '/dashboard' },
  { key: 'loyalty', label: 'Лояльность', icon: AccountBalanceWalletOutlinedIcon, href: '/loyalty' },
  { key: 'maps', label: 'Карты', icon: PlaceOutlinedIcon, href: '/maps' },
  { key: 'profile', label: 'Профиль', icon: PersonOutlineIcon, href: '/profile' },
] as const;

export function BottomNav({ fab, activeTab }: BottomNavProps) {
  const router = useRouter();

  const fabLabel = fab === 'upload' ? 'ЗАГРУЗИТЬ' : 'ЗАКАЗАТЬ';
  const fabColor = fab === 'order-dark' ? colors.navy : colors.orangeDeep;
  const fabHref = fab === 'upload' ? '/scan' : '/checkout';
  const FabIcon = fab === 'upload' ? AddIcon : QrCode2Icon;

  const renderTab = (tab: (typeof TABS)[number]) => {
    const active = tab.key === activeTab;
    const Icon = tab.icon;
    return (
      <ButtonBase
        key={tab.key}
        onClick={() => router.push(tab.href)}
        sx={{
          flexDirection: 'column',
          gap: 0.4,
          flex: 1,
          py: 1,
          borderRadius: 2,
          color: active ? colors.navy : colors.textMuted,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
        <Typography sx={{ fontSize: 11, fontWeight: active ? 700 : 500, color: 'inherit' }}>
          {tab.label}
        </Typography>
      </ButtonBase>
    );
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        zIndex: 20,
      }}
    >
      {/* Floating action button */}
      <ButtonBase
        onClick={() => router.push(fabHref)}
        sx={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 62,
          height: 62,
          borderRadius: '50%',
          bgcolor: fabColor,
          color: '#fff',
          border: '4px solid #fff',
          boxShadow: '0 8px 20px rgba(240, 78, 35, 0.35)',
          zIndex: 2,
          '&:hover': { bgcolor: fabColor },
        }}
        aria-label={fabLabel}
      >
        <FabIcon sx={{ fontSize: 30 }} />
      </ButtonBase>

      <Box
        sx={{
          bgcolor: '#fff',
          borderTop: `1px solid ${colors.divider}`,
          display: 'flex',
          alignItems: 'flex-end',
          px: 1,
          pb: 'max(env(safe-area-inset-bottom), 8px)',
          pt: 1,
          boxShadow: '0 -8px 24px rgba(23, 26, 78, 0.06)',
        }}
      >
        {renderTab(TABS[0])}
        {renderTab(TABS[1])}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', pb: 0.5 }}>
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 800,
              color: fab === 'order-dark' ? colors.navy : colors.orangeDeep,
              mt: 4.2,
              letterSpacing: 0.3,
            }}
          >
            {fabLabel}
          </Typography>
        </Box>
        {renderTab(TABS[2])}
        {renderTab(TABS[3])}
      </Box>
    </Box>
  );
}
