'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import PlaceIcon from '@mui/icons-material/Place';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const USER_NAME = 'Jasur Ruzikulov';
const USER_INITIALS = 'JR';
const LOCATION = 'Г. ТАШКЕНТ, БИЗНЕС ЦЕНТР DIAMOND';

function greetingByHour(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function GreetingHeader() {
  const greeting = greetingByHour(new Date().getHours());

  return (
    <Box
      sx={{
        mx: 1,
        mt: 1,
        borderRadius: '24px',
        background: 'linear-gradient(100deg, #14165B 0%, #1D2380 55%, #2B39AC 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 2,
      }}
    >
      {/* avatar */}
      <Box
        sx={{
          width: 46,
          height: 46,
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
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>
            {USER_INITIALS}
          </Typography>
        </Box>
      </Box>

      {/* greeting + location */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }} noWrap>
          {greeting}, {USER_NAME}!
        </Typography>
        <ButtonBase
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            borderRadius: 1,
            maxWidth: '100%',
          }}
        >
          <PlaceIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
          <Typography
            noWrap
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: 0.3,
            }}
          >
            {LOCATION}
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
        </ButtonBase>
      </Box>

      {/* notification bell */}
      <IconButton
        aria-label="Уведомления"
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          border: '1.5px solid rgba(255,255,255,0.35)',
          color: '#fff',
          position: 'relative',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <NotificationsNoneIcon sx={{ fontSize: 20 }} />
        <Box
          sx={{
            position: 'absolute',
            top: 7,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: '#F94C10',
            border: '1.5px solid #1D2380',
          }}
        />
      </IconButton>
    </Box>
  );
}
