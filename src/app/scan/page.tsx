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
import { useAppDispatch } from '@/store/hooks';
import { addMeal } from '@/store/slices/mealsSlice';
import { compressImage } from '@/lib/image';
import { analyze, postMeal, uploadMealPhoto } from '@/lib/api/client';
import { handleSubscriptionError, subscriptionErrorMessage } from '@/lib/subscriptionGate';
import { isNativeWebView, requestNativePhoto } from '@/lib/nativeBridge';
import { useAuthGuard } from '@/lib/useAuthGuard';

type Status = 'idle' | 'analyzing';

export default function ScanPage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [nativeMode, setNativeMode] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNativeMode(isNativeWebView());
  }, []);

  useEffect(() => {
    if (nativeMode) return;
    let cancelled = false;
    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
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
        // insecure context / denied — native bridge or gallery still works
      }
    }
    void startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [nativeMode]);

  const runAnalyze = useCallback(
    async (photoDataUrl: string) => {
      setStatus('analyzing');
      try {
        const data = await analyze({ image: photoDataUrl });
        if (!data.isFood) {
          setError('На фото не удалось распознать еду. Попробуйте ещё раз.');
          setStatus('idle');
          return;
        }
        const photoUrl = await uploadMealPhoto(photoDataUrl);
        const meal = await postMeal({
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
        if (handleSubscriptionError(e, router)) {
          setStatus('idle');
          return;
        }
        const subMsg = subscriptionErrorMessage(e);
        setError(subMsg ?? (e instanceof Error ? e.message : 'Ошибка анализа. Попробуйте ещё раз.'));
        setStatus('idle');
      }
    },
    [dispatch, router],
  );

  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_PHOTO_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_PHOTO_KEY);
      void runAnalyze(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickNative = useCallback(
    async (source: 'camera' | 'gallery') => {
      if (status === 'analyzing') return;
      try {
        const dataUrl = await requestNativePhoto(source);
        const compressed = await compressImage(dataUrl);
        void runAnalyze(compressed);
      } catch (e) {
        if (e instanceof Error && e.message === 'cancelled') return;
        setError('Не удалось получить фото. Проверьте разрешение камеры.');
      }
    },
    [runAnalyze, status],
  );

  const handleCapture = useCallback(async () => {
    if (status === 'analyzing') return;
    if (nativeMode || !cameraReady) {
      void pickNative('camera');
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const raw = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressImage(raw);
    void runAnalyze(compressed);
  }, [runAnalyze, cameraReady, status, nativeMode, pickNative]);

  const handleGallery = useCallback(() => {
    if (status === 'analyzing') return;
    if (nativeMode) {
      void pickNative('gallery');
      return;
    }
    fileInputRef.current?.click();
  }, [nativeMode, pickNative, status]);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || status === 'analyzing') return;
      try {
        const compressed = await compressImage(file);
        void runAnalyze(compressed);
      } catch {
        setError('Не удалось открыть изображение');
      }
    },
    [runAnalyze, status],
  );

  const shutterEnabled = nativeMode || cameraReady;

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

        <Box
          sx={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: nativeMode ? 'pointer' : 'default' }}
          onClick={() => {
            if (nativeMode && status === 'idle') void pickNative('camera');
          }}
        >
          {!nativeMode && (
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
          )}
          {(nativeMode || !cameraReady) && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                px: 3,
              }}
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 96, color: 'rgba(255,255,255,0.2)' }} />
              {nativeMode && (
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, textAlign: 'center' }}>
                  Нажмите кнопку ниже, чтобы открыть камеру
                </Typography>
              )}
            </Box>
          )}

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
            onClick={handleGallery}
            disabled={status === 'analyzing'}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', width: 52, height: 52 }}
            aria-label="Загрузить из галереи"
          >
            <PhotoLibraryOutlinedIcon />
          </IconButton>
          <ButtonBase
            onClick={handleCapture}
            disabled={!shutterEnabled || status === 'analyzing'}
            aria-label="Сделать фото"
            sx={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: shutterEnabled ? 1 : 0.35,
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
          capture="environment"
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
