'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { colors } from '@/theme/theme';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  showHelp?: boolean;
  elevated?: boolean;
}

export function PageHeader({ title, onBack, onClose, showHelp, elevated }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        pb: 1.75,
        pt: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        position: 'relative',
        bgcolor: elevated ? '#FAFAFC' : 'transparent',
        borderBottom: elevated ? `1px solid ${colors.divider}` : 'none',
      }}
    >
      {onBack && (
        <IconButton onClick={onBack} sx={{ color: colors.heading, mr: 1, p: 0.5 }} aria-label="Назад">
          <ArrowBackIcon />
        </IconButton>
      )}
      <Typography
        variant="h3"
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 22,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ ml: 'auto' }}>
        {onClose && (
          <IconButton
            onClick={onClose}
            aria-label="Закрыть"
            sx={{
              bgcolor: '#E4E5EA',
              color: '#5A5D6E',
              width: 34,
              height: 34,
              '&:hover': { bgcolor: '#D8D9E0' },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
        {showHelp && (
          <IconButton aria-label="Помощь" sx={{ color: colors.textSecondary }}>
            <HelpOutlineIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
