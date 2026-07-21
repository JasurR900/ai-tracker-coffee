'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateSubscription } from '@/store/slices/subscriptionSlice';
import { setSubscription } from '@/store/slices/profileSlice';
import { getSubscriptionStatus } from '@/lib/api/client';
import { useAuthGuard } from '@/lib/useAuthGuard';

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { ready } = useAuthGuard();
  const dispatch = useAppDispatch();
  const sub = useAppSelector((s) => s.subscription);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getSubscriptionStatus();
        if (cancelled) return;
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
      } catch {
        // keep cached state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const subscription = sub.subscription;
  const isTrial = subscription?.planId === 'free_trial';
  const rows: Array<[string, string]> = subscription
    ? [
        ['Тариф', subscription.label],
        ['Тип', isTrial ? 'Пробный период' : 'Платная подписка'],
        ['Подписка', sub.subscriptionActive ? 'Активна' : 'Истекла'],
        ['Оставшиеся дни', String(sub.daysLeft)],
        [isTrial ? 'Дата активации' : 'Дата оплаты', formatDate(subscription.paidAt)],
        ['Истекает', formatDate(subscription.expiresAt)],
      ]
    : [];

  return (
    <AppShell>
      <PageHeader title="Статус подписки" onClose={() => router.push('/profile')} elevated />

      <Box sx={{ px: 2.5, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: colors.navy }} />
          </Box>
        ) : ready && !subscription ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                bgcolor: '#FEEDE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WorkspacePremiumIcon sx={{ fontSize: 42, color: colors.orangeDeep }} />
            </Box>
            <Typography sx={{ fontSize: 19, fontWeight: 800, color: colors.heading }}>
              Подписки пока нет
            </Typography>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 14.5 }}>
              Оформите Premium, чтобы открыть все возможности AI-трекера
            </Typography>
            <PrimaryButton onClick={() => router.push('/premium')} sx={{ mt: 1 }}>
              Оформить Premium
            </PrimaryButton>
          </Box>
        ) : (
          <>
            <Paper sx={{ borderRadius: '18px', px: 2.5, py: 1 }}>
              {rows.map(([label, value], i) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.75,
                    borderBottom: i < rows.length - 1 ? `1px solid ${colors.divider}` : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: 14.5, color: 'text.secondary' }}>{label}</Typography>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: colors.heading }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Paper>
            {!sub.subscriptionActive && (
              <PrimaryButton onClick={() => router.push('/premium')} sx={{ mt: 3 }}>
                Продлить подписку
              </PrimaryButton>
            )}
          </>
        )}
      </Box>
    </AppShell>
  );
}
