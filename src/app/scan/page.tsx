'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { AppShell, PENDING_PHOTO_KEY } from '@/components/layout/AppShell';
import { useAppDispatch, useAppStore } from '@/store/hooks';
import { addMeal } from '@/store/slices/mealsSlice';
import { compressImage } from '@/lib/image';
import { insertMeal, uploadMealPhoto } from '@/lib/supabase/db';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { FoodAnalysis } from '@/types';

type Status = 'idle' | 'analyzing';

export default function ScanPage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
          setCameraReady(true);
        }
      } catch {
        // camera unavailable — the gallery upload still works
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const analyze = useCallback(
    async (photoDataUrl: string) => {
      setStatus('analyzing');
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: photoDataUrl }),
        });
        const data = (await res.json()) as FoodAnalysis & { error?: string };
        if (!res.ok) throw new Error(data.error || 'Не удалось проанализировать фото');
        if (!data.isFood) {
          setError('На фото не удалось распознать еду. Попробуйте ещё раз.');
          setStatus('idle');
          return;
        }
        const userId = store.getState().app.userId;
        if (!userId) {
          router.push('/auth');
          return;
        }
        const photoUrl = await uploadMealPhoto(userId, photoDataUrl);
        const meal = await insertMeal(userId, {
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          fats: data.fats,
          carbs: data.carbs,
          description: data.description,
          photo: photoUrl,
        });
        dispatch(addMeal(meal));
        router.push(`/food/${meal.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка анализа. Попробуйте ещё раз.');
        setStatus('idle');
      }
    },
    [dispatch, router, store],
  );

  // a photo picked from the gallery FAB menu arrives via sessionStorage
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_PHOTO_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_PHOTO_KEY);
      void analyze(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !cameraReady || status === 'analyzing') return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const raw = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressImage(raw);
    void analyze(compressed);
  }, [analyze, cameraReady, status]);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || status === 'analyzing') return;
      try {
        const compressed = await compressImage(file);
        void analyze(compressed);
      } catch {
        setError('Не удалось открыть изображение');
      }
    },
    [analyze, status],
  );

  return (
    <AppShell dark>
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#050508',
          borderRadius: { sm: '28px' },
          overflow: 'hidden',
          m: { sm: 1 },
          minHeight: '100dvh',
        }}
      >
        {/* top handle bar */}
        <Box
          sx={{
            width: 60,
            height: 4,
            borderRadius: 2,
            bgcolor: '#fff',
            mx: 'auto',
            mt: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            opacity: 0.9,
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, mt: 1 }}>
          <IconButton onClick={() => router.back()} sx={{ color: '#fff' }} aria-label="Назад">
            <ArrowBackIcon />
          </IconButton>
          <Typography
            sx={{
              flex: 1,
              textAlign: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              mr: 5,
            }}
          >
            Отсканируйте свою еду
          </Typography>
        </Box>

        {/* camera viewport */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: cameraReady ? 1 : 0,
            }}
          />
          {!cameraReady && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 96, color: 'rgba(255,255,255,0.08)' }} />
            </Box>
          )}

          {/* scan line */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: 2,
              background:
                'linear-gradient(90deg, transparent 0%, #2743F0 25%, #4E6BFF 50%, #2743F0 75%, transparent 100%)',
              boxShadow: '0 0 18px 3px rgba(60, 90, 255, 0.55)',
              animation: status === 'analyzing' ? 'scanline 1.6s ease-in-out infinite' : 'none',
              '@keyframes scanline': {
                '0%, 100%': { transform: 'translateY(-90px)' },
                '50%': { transform: 'translateY(90px)' },
              },
            }}
          />

          {status === 'analyzing' && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: 'rgba(5, 5, 10, 0.55)',
              }}
            >
              <CircularProgress sx={{ color: '#4E6BFF' }} />
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                ИИ анализирует блюдо...
              </Typography>
            </Box>
          )}
        </Box>

        {/* controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            py: 3.5,
            pb: 'max(env(safe-area-inset-bottom), 28px)',
          }}
        >
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={status === 'analyzing'}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', width: 52, height: 52 }}
            aria-label="Загрузить из галереи"
          >
            <PhotoLibraryOutlinedIcon />
          </IconButton>
          <ButtonBase
            onClick={handleCapture}
            disabled={!cameraReady || status === 'analyzing'}
            aria-label="Сделать фото"
            sx={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: cameraReady ? 1 : 0.35,
            }}
          >
            <Box sx={{ width: 58, height: 58, borderRadius: '50%', bgcolor: '#fff' }} />
          </ButtonBase>
          <Box sx={{ width: 52 }} />
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
      </Box>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
