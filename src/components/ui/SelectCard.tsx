'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import CheckIcon from '@mui/icons-material/Check';
import { colors } from '@/theme/theme';

interface SelectCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectCard({ icon, title, subtitle, selected, onClick }: SelectCardProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        gap: 1.75,
        p: 2,
        borderRadius: '16px',
        bgcolor: selected ? colors.selectedBg : '#fff',
        border: `1.5px solid ${selected ? colors.navy : 'transparent'}`,
        boxShadow: selected ? 'none' : '0 4px 16px rgba(23, 26, 78, 0.05)',
        transition: 'all 0.15s ease',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: selected ? '#E0E0F2' : '#EEEFF5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.navy,
          flexShrink: 0,
          fontSize: 24,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 17, color: colors.heading, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 13.5, color: colors.textSecondary, mt: 0.25, lineHeight: 1.35 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {selected ? (
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            bgcolor: colors.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />
        </Box>
      ) : (
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: `2px solid ${colors.track}`,
            flexShrink: 0,
          }}
        />
      )}
    </ButtonBase>
  );
}
