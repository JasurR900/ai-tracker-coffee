'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import QRCode from 'qrcode';

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

function isMobileDevice(): boolean {
  // Native WebView bridge — always treat as mobile
  if (typeof window !== 'undefined' && window.ReactNativeWebView) return true;
  if (MOBILE_UA.test(navigator.userAgent)) return true;
  // touch-first devices (tablets, phones with desktop-mode UA)
  return navigator.maxTouchPoints > 1 && window.innerWidth < 1024;
}

/**
 * Blocks desktop access: the app is phone-only. Shows a full-screen notice
 * with a QR code of the current URL. Bypass for development: `?desktop=1`.
 */
export function DeviceGate({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const bypass = new URLSearchParams(window.location.search).get('desktop') === '1';
    if (bypass || isMobileDevice()) return;
    setBlocked(true);
    QRCode.toDataURL(window.location.origin, {
      width: 220,
      margin: 1,
      color: { dark: '#14165B', light: '#FFFFFF' },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);

  if (!blocked) return <>{children}</>;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #14165B 0%, #1D2380 55%, #2B39AC 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PhoneIphoneIcon sx={{ fontSize: 44, color: '#fff' }} />
      </Box>

      <Box>
        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 26, lineHeight: 1.3 }}>
          Откройте на телефоне
        </Typography>
        <Typography
          sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 15.5, mt: 1.5, maxWidth: 420, mx: 'auto' }}
        >
          Счётчик калорий — мобильное приложение. Пожалуйста, отсканируйте QR-код камерой
          смартфона или откройте этот адрес на телефоне.
        </Typography>
      </Box>

      {qr && (
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '20px',
            p: 1.5,
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            lineHeight: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR-код для открытия на телефоне" width={190} height={190} />
        </Box>
      )}
    </Box>
  );
}
