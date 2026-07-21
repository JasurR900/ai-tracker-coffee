'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { colors } from '@/theme/theme';
import { openExternalUrl } from '@/lib/nativeBridge';

const SUPPORT_TELEGRAM = 'https://t.me/pointcoffeeuz';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  showHelp?: boolean;
  elevated?: boolean;
}

export function PageHeader({ title, onBack, onClose, showHelp, elevated }: PageHeaderProps) {
  const handleClose = onClose ?? onBack;

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
        minHeight: 56,
      }}
    >
      {handleClose ? (
        <IconButton
          onClick={handleClose}
          aria-label="Close"
          sx={{
            position: 'relative',
            zIndex: 1,
            color: colors.heading,
            p: 0.75,
            mr: 0.5,
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ) : (
        <Box sx={{ width: 40 }} />
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
          maxWidth: '55%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>

      <Box sx={{ ml: 'auto', minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>
        {showHelp ? (
          <IconButton
            aria-label="Помощь"
            onClick={() => openExternalUrl(SUPPORT_TELEGRAM)}
            sx={{ color: colors.textSecondary }}
          >
            <HelpOutlineIcon />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}
