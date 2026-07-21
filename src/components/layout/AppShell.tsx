'use client';

import { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { colors } from '@/theme/theme';
import { compressImage } from '@/lib/image';
import { navigate } from '@/lib/navigate';
import { isNativeWebView, requestNativePhoto } from '@/lib/nativeBridge';

export const PENDING_PHOTO_KEY = 'calai:pending-photo';

interface AppShellProps {
  children: React.ReactNode;
  /** Show the bottom bar with home / "+" (Камера-Галерея-Текст) / settings. */
  scanFab?: boolean;
  dark?: boolean;
}

export function AppShell({ children, scanFab = false, dark = false }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNativeCapture = async (source: 'camera' | 'gallery') => {
    try {
      const dataUrl = await requestNativePhoto(source);
      const compressed = await compressImage(dataUrl);
      sessionStorage.setItem(PENDING_PHOTO_KEY, compressed);
      setMenuOpen(false);
      navigate(router, '/scan');
    } catch {
      // cancelled or failed — keep menu closed if user cancelled
      setMenuOpen(false);
    }
  };

  const handleGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      sessionStorage.setItem(PENDING_PHOTO_KEY, dataUrl);
      setMenuOpen(false);
      navigate(router, '/scan');
    } catch {
      // ignore unreadable files
    }
  };

  const menuItem = (label: string, icon: React.ReactNode, onClick: () => void, delay = 0) => (
    <Box
      className="fab-menu-item"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        animationDelay: `${delay}ms`,
      }}
    >
      <ButtonBase
        onClick={onClick}
        aria-label={label}
        sx={{
          width: 56,
          height: 56,
          borderRadius: '18px',
          bgcolor: colors.navy,
          color: '#fff',
          boxShadow: '0 8px 20px rgba(20, 22, 91, 0.35)',
          '&:hover': { bgcolor: colors.navyDark },
        }}
      >
        {icon}
      </ButtonBase>
      <Typography
        sx={{
          bgcolor: '#fff',
          borderRadius: '10px',
          px: 1.5,
          py: 0.4,
          fontSize: 12.5,
          fontWeight: 700,
          color: colors.heading,
          boxShadow: '0 4px 12px rgba(20, 22, 91, 0.15)',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  const sideButton = (
    label: string,
    icon: React.ReactNode,
    href: string,
    active: boolean,
  ) => (
    <ButtonBase
      onClick={() => navigate(router, href)}
      aria-label={label}
      sx={{
        width: 46,
        height: 46,
        borderRadius: '14px',
        color: active ? colors.navy : '#B4B7C3',
        '&:hover': { bgcolor: 'rgba(27,27,109,0.05)' },
      }}
    >
      {icon}
    </ButtonBase>
  );

  return (
    <Box
      sx={{
        width: '100%',
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
          pb: scanFab ? '92px' : 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      {scanFab && (
        <>
          {/* dim backdrop while the menu is open */}
          {menuOpen && (
            <Box
              className="fab-backdrop"
              onClick={() => setMenuOpen(false)}
              sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 25,
                bgcolor: 'rgba(15, 16, 40, 0.45)',
                backdropFilter: 'blur(2px)',
              }}
            />
          )}

          {/* bottom bar */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 430,
              zIndex: 26,
            }}
          >
            {menuOpen && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 3,
                  mb: 2.5,
                }}
              >
                {menuItem(
                  'Галерея',
                  <PhotoLibraryOutlinedIcon />,
                  () => {
                    if (isNativeWebView()) {
                      void openNativeCapture('gallery');
                      return;
                    }
                    fileInputRef.current?.click();
                  },
                  40,
                )}
                <Box sx={{ mb: 3 }}>
                  {menuItem(
                    'Камера',
                    <PhotoCameraOutlinedIcon />,
                    () => {
                      if (isNativeWebView()) {
                        void openNativeCapture('camera');
                        return;
                      }
                      setMenuOpen(false);
                      navigate(router, '/scan');
                    },
                    0,
                  )}
                </Box>
                {menuItem(
                  'Текст',
                  <EditNoteIcon />,
                  () => {
                    setMenuOpen(false);
                    navigate(router, '/add-text');
                  },
                  80,
                )}
              </Box>
            )}

            <Box
              sx={{
                position: 'relative',
                bgcolor: '#fff',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -8px 28px rgba(23, 26, 78, 0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 4,
                pt: 0.5,
                pb: 'max(env(safe-area-inset-bottom), 4px)',
              }}
            >
              {sideButton(
                'Главная',
                <HomeOutlinedIcon sx={{ fontSize: 26 }} />,
                '/dashboard',
                pathname === '/dashboard',
              )}

              {/* raised center button */}
              <ButtonBase
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Закрыть' : 'Добавить приём пищи'}
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  mt: -3.5,
                  bgcolor: menuOpen ? colors.navy : colors.orangeDeep,
                  color: '#fff',
                  border: '4px solid #fff',
                  boxShadow: menuOpen
                    ? '0 8px 20px rgba(20, 22, 91, 0.4)'
                    : '0 8px 20px rgba(240, 78, 35, 0.4)',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { bgcolor: menuOpen ? colors.navyDark : colors.orange },
                }}
              >
                {menuOpen ? <CloseIcon sx={{ fontSize: 30 }} /> : <AddIcon sx={{ fontSize: 32 }} />}
              </ButtonBase>

              {sideButton(
                'Настройки',
                <SettingsOutlinedIcon sx={{ fontSize: 26 }} />,
                '/profile',
                pathname === '/profile',
              )}
            </Box>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleGalleryFile}
          />
        </>
      )}
    </Box>
  );
}
