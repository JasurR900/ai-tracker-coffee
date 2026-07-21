'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { formatSum } from '@/lib/format';
import { mapApiPlans, type PremiumPlan } from '@/lib/premium';
import { getPlans, getSubscriptionStatus, postTrial, putProfile } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import { hydrateSubscription } from '@/store/slices/subscriptionSlice';
import { setSubscription } from '@/store/slices/profileSlice';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { parsePurchaseGate, type PurchaseGateInfo } from '@/lib/purchaseErrors';

const FEATURES = [
  { icon: CameraAltIcon, label: 'Безлимитный AI-сканер еды и напитков' },
  { icon: PieChartIcon, label: 'Анализ КБЖУ с точностью до грамма' },
  { icon: BarChartIcon, label: 'Расширенная статистика' },
  { icon: NotificationsActiveIcon, label: 'Умные напоминания' },
];

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function applyStatus(
  dispatch: ReturnType<typeof useAppDispatch>,
  status: Awaited<ReturnType<typeof getSubscriptionStatus>>,
) {
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
}

export default function PremiumPage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const trialUsed = useAppSelector((s) => s.subscription.trialUsed);
  const subscriptionActive = useAppSelector((s) => s.subscription.subscriptionActive);

  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Server said trial cannot be started (plan missing / already used / not eligible). */
  const [trialBlocked, setTrialBlocked] = useState(false);
  const [gate, setGate] = useState<PurchaseGateInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [offers, status] = await Promise.all([
          getPlans(),
          getSubscriptionStatus().catch(() => null),
        ]);
        if (cancelled) return;
        setPlans(mapApiPlans(offers));
        if (status) {
          applyStatus(dispatch, status);
          if (status.trialUsed || status.access?.allowed) {
            setTrialBlocked(Boolean(status.trialUsed));
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Не удалось загрузить тарифы');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const showTrial = !trialUsed && !subscriptionActive && !trialBlocked;
  // Active trial: still show paid plans (extend / marketing).
  const showPaidPlans = !showTrial || trialBlocked || subscriptionActive;

  const handleTrial = async () => {
    setTrialLoading(true);
    setError(null);
    try {
      // Trial requires a nutrition profile — save local onboarding first if needed.
      const { profile } = store.getState();
      if (profile.onboardingCompleted || profile.plan) {
        await putProfile(profile).catch(() => undefined);
      }

      const result = await postTrial();
      if (result.subscription) dispatch(setSubscription(result.subscription));
      const status = await getSubscriptionStatus();
      applyStatus(dispatch, status);
      router.replace(status.access?.allowed ? '/dashboard' : '/subscription');
    } catch (e) {
      if (e instanceof ApiError) {
        const code = normalizeCode(e.messageCode);
        if (
          code === 'TRIAL_ALREADY_USED' ||
          code === 'TRIAL_NOT_AVAILABLE' ||
          code === 'TRAIL_NOT_AVAILABLE' ||
          code.includes('TRIAL_NOT') ||
          code.includes('TRAIL_NOT')
        ) {
          setTrialBlocked(true);
          setError(
            code.includes('ALREADY')
              ? 'Пробный период уже использован. Выберите тариф.'
              : 'Бесплатный пробный период сейчас недоступен. Выберите тариф.',
          );
          try {
            const status = await getSubscriptionStatus();
            applyStatus(dispatch, status);
          } catch {
            // keep UI on paid plans
          }
        } else if (code === 'SUBSCRIPTION_ALREADY_ACTIVE') {
          setGate({
            kind: 'already_active',
            title: 'Подписка уже активна',
            body: 'У вас уже есть активный доступ. Можно продлить платным тарифом — срок добавится после текущей даты.',
          });
        } else {
          const gateInfo = parsePurchaseGate(e);
          if (gateInfo) {
            setGate(gateInfo);
            return;
          }
          setError(e.message);
        }
      } else {
        setError(e instanceof Error ? e.message : 'Не удалось активировать пробный период');
      }
    } finally {
      setTrialLoading(false);
    }
  };

  const openCheckout = (planId: string) => {
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <AppShell>
      <PageHeader title="Premium Access" onBack={() => router.replace('/dashboard')} />

      <Box sx={{ px: 2.5, pt: 1, pb: 3 }}>
        <Box
          sx={{
            borderRadius: '20px',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(120deg, #3F3F8F 0%, #8B8BC7 55%, #C9C9E8 100%)',
            minHeight: 170,
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>
            Premium Доступ
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14.5, mt: 0.75, maxWidth: 165 }}>
            Разблокируйте все возможности AI-трекера
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              right: 18,
              bottom: 14,
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: '#F6E7C8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 24px rgba(20,20,60,0.25)',
            }}
          >
            <CameraAltIcon sx={{ fontSize: 42, color: '#2E2E6E' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 2 }}>
          {FEATURES.map(({ icon: Icon, label }) => (
            <Paper key={label} sx={{ borderRadius: '16px', p: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#FEEDE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.25,
                }}
              >
                <Icon sx={{ fontSize: 21, color: colors.orangeDeep }} />
              </Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: colors.heading, lineHeight: 1.4 }}>
                {label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {showTrial && (
          <PrimaryButton
            onClick={handleTrial}
            disabled={trialLoading}
            sx={{ mt: 3, letterSpacing: 1, fontSize: 16 }}
          >
            {trialLoading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              '1 МЕСЯЦ БЕСПЛАТНО'
            )}
          </PrimaryButton>
        )}

        {showPaidPlans &&
          (loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: colors.navy }} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: colors.heading, mb: 0.5 }}>
                Выберите тариф
              </Typography>
              {plans.map((plan) => (
                <Box key={plan.id} sx={{ position: 'relative' }}>
                  {plan.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -9,
                        right: 16,
                        zIndex: 1,
                        bgcolor: plan.badge === 'ЛУЧШАЯ ЦЕНА' ? colors.navy : colors.orangeDeep,
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        px: 1.25,
                        py: 0.4,
                        borderRadius: '6px',
                      }}
                    >
                      {plan.badge}
                    </Box>
                  )}
                  <ButtonBase
                    onClick={() => openCheckout(plan.id)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: '#fff',
                      border: '2px solid #E8E9EF',
                      textAlign: 'left',
                      '&:active': { borderColor: colors.orangeDeep },
                    }}
                  >
                    <Typography sx={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: colors.heading }}>
                      {plan.label}
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: colors.heading }}>
                      {formatSum(plan.price)}
                    </Typography>
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          ))}
      </Box>

      <Dialog
        open={Boolean(gate)}
        onClose={() => setGate(null)}
        slotProps={{ paper: { sx: { borderRadius: '18px', mx: 2, width: '100%', maxWidth: 360 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: colors.heading, pb: 1 }}>
          {gate?.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14.5, color: 'text.secondary', lineHeight: 1.45 }}>
            {gate?.body}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1, flexDirection: 'column' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setGate(null);
              if (gate?.kind === 'already_active') router.push('/subscription');
            }}
            sx={{ bgcolor: colors.navy, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
          >
            {gate?.kind === 'already_active' ? 'Статус подписки' : 'Понятно'}
          </Button>
          {gate?.kind === 'already_active' ? (
            <Button
              fullWidth
              onClick={() => setGate(null)}
              sx={{ color: colors.navy, textTransform: 'none', fontWeight: 700 }}
            >
              Выбрать тариф
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

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
