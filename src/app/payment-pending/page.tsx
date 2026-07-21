'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ButtonBase from '@mui/material/ButtonBase';
import { keyframes } from '@mui/system';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { colors } from '@/theme/theme';
import { getPurchase, getSubscriptionStatus } from '@/lib/api/client';
import { openExternalPayment } from '@/lib/nativeBridge';
import { isSafePaymentUrl } from '@/lib/paymentUrl';
import { useAppDispatch } from '@/store/hooks';
import { hydrateSubscription } from '@/store/slices/subscriptionSlice';
import { setSubscription } from '@/store/slices/profileSlice';
import { useAuthGuard } from '@/lib/useAuthGuard';
import {
  clearPendingPurchase,
  loadPendingPurchase,
  savePendingPurchase,
} from '@/lib/pendingPurchase';

const softPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50% { transform: scale(1.08); opacity: 1; }
`;

function isPaid(status: { status?: string; paymentStatus?: string }): boolean {
  const s = (status.status ?? '').toLowerCase();
  const p = (status.paymentStatus ?? '').toLowerCase();
  return s === 'paid' || p === 'paid' || s === 'completed' || p === 'completed';
}

function PaymentPendingContent() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const purchaseIdParam = searchParams.get('purchaseId');

  const [purchaseId, setPurchaseId] = useState<string | null>(purchaseIdParam);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('Ожидается оплата');
  const [subtext, setSubtext] = useState('Открываем платёжную систему…');
  const [openError, setOpenError] = useState<string | null>(null);
  const openedRef = useRef(false);
  const doneRef = useRef(false);

  const applyStatus = async () => {
    const status = await getSubscriptionStatus();
    dispatch(
      hydrateSubscription({
        subscription: status.subscription ?? status.active ?? null,
        subscriptionActive: Boolean(status.access?.allowed),
        subscriptionStatus: status.access?.allowed
          ? 'active'
          : status.subscription || status.trialUsed
            ? 'expired'
            : 'none',
        daysLeft: status.access?.daysLeft ?? status.active?.daysLeft ?? 0,
        trialUsed: Boolean(status.trialUsed),
        accessAllowed: Boolean(status.access?.allowed),
        accessCode: status.access?.code ?? 'SUBSCRIPTION_REQUIRED',
      }),
    );
    dispatch(setSubscription(status.subscription ?? status.active ?? null));
    return status;
  };

  useEffect(() => {
    const stored = loadPendingPurchase();
    const id = purchaseIdParam || stored?.purchaseId || null;
    const url = stored?.paymentUrl || null;
    setPurchaseId(id);
    setPaymentUrl(url);
    // eslint-disable-next-line no-console
    console.log('[payment-pending] hydrate', { id, url, stored });
    if (id) {
      savePendingPurchase({
        purchaseId: id,
        paymentUrl: url ?? stored?.paymentUrl,
        planId: stored?.planId,
        provider: stored?.provider,
      });
    }
  }, [purchaseIdParam]);

  useEffect(() => {
    if (!paymentUrl || openedRef.current) return;
    if (!isSafePaymentUrl(paymentUrl)) {
      // eslint-disable-next-line no-console
      console.warn('[payment-pending] unsafe url', paymentUrl);
      setOpenError('Некорректная ссылка на оплату. Попробуйте другой способ.');
      setSubtext('Ссылка на оплату недоступна или небезопасна.');
      return;
    }
    openedRef.current = true;
    // eslint-disable-next-line no-console
    console.log('[payment-pending] auto-open', paymentUrl);
    openExternalPayment(paymentUrl);
    setSubtext('Завершите оплату во внешнем окне. Статус обновится автоматически.');
  }, [paymentUrl]);

  useEffect(() => {
    if (!purchaseId) {
      setMessage('Платёж не найден');
      setSubtext('Вернитесь к оформлению и попробуйте снова.');
      return;
    }

    let cancelled = false;
    let ticks = 0;
    let interval = 0;

    const stop = () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };

    const finishPaid = async () => {
      if (doneRef.current) return;
      doneRef.current = true;
      stop();
      clearPendingPurchase();
      setMessage('Оплата подтверждена');
      setSubtext('Подписка активирована…');
      try {
        await applyStatus();
      } catch {
        // still navigate
      }
      // Absolute URL keeps us on Cal AI origin (never Telegram / Payme host).
      const next = `${window.location.origin}/subscription`;
      window.location.replace(next);
    };

    const tick = async () => {
      if (doneRef.current || cancelled) return;
      try {
        const purchase = await getPurchase(purchaseId);
        if (doneRef.current || cancelled) return;
        const nextUrl = purchase.paymentUrl;
        if (nextUrl && isSafePaymentUrl(nextUrl) && !paymentUrl) {
          setPaymentUrl(nextUrl);
          const prev = loadPendingPurchase();
          savePendingPurchase({
            purchaseId,
            paymentUrl: nextUrl,
            planId: prev?.planId,
            provider: prev?.provider,
          });
        }
        if (isPaid(purchase)) {
          await finishPaid();
          return;
        }
        setMessage('Ожидается оплата');
      } catch {
        // keep waiting
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void tick();
    };

    void tick();
    interval = window.setInterval(() => {
      ticks += 1;
      if (ticks > 80) {
        stop();
        return;
      }
      void tick();
    }, 2500);

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseId]);

  return (
    <AppShell>
      <PageHeader title="Оплата" onClose={() => router.replace('/premium')} elevated />

      <Box
        sx={{
          px: 2.5,
          pt: 5,
          pb: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #FFF4EE 0%, #F4F5F9 42%, #F4F5F9 100%)',
        }}
      >
        <Box sx={{ position: 'relative', width: 120, height: 120, mb: 3 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              bgcolor: 'rgba(249, 76, 16, 0.12)',
              animation: `${softPulse} 2s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 14,
              borderRadius: '50%',
              bgcolor: '#fff',
              boxShadow: '0 10px 28px rgba(249, 76, 16, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaymentsOutlinedIcon sx={{ fontSize: 36, color: colors.orange }} />
          </Box>
          <CircularProgress
            size={120}
            thickness={2.2}
            sx={{
              color: colors.orange,
              position: 'absolute',
              inset: 0,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.heading,
            mb: 1,
          }}
        >
          {message}
        </Typography>
        <Typography
          sx={{
            fontSize: 14.5,
            color: 'text.secondary',
            maxWidth: 300,
            lineHeight: 1.5,
          }}
        >
          {openError ?? subtext}
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            px: 1.75,
            py: 0.85,
            borderRadius: '999px',
            bgcolor: 'rgba(249, 76, 16, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: colors.orange,
              animation: `${softPulse} 1.4s ease-in-out infinite`,
            }}
          />
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.orangeDeep }}>
            Ожидаем подтверждение
          </Typography>
        </Box>

        {paymentUrl && isSafePaymentUrl(paymentUrl) ? (
          <ButtonBase
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('[payment-pending] reopen', paymentUrl);
              openExternalPayment(paymentUrl);
            }}
            sx={{
              mt: 4,
              color: colors.orangeDeep,
              fontSize: 13.5,
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Открыть оплату снова
          </ButtonBase>
        ) : null}
      </Box>
    </AppShell>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPendingContent />
    </Suspense>
  );
}
