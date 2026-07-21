'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { formatSum } from '@/lib/format';
import { getPlanFromList, mapApiPlans, type PremiumPlan } from '@/lib/premium';
import {
  getPaymentMethods,
  getPlans,
  getSubscriptionStatus,
  getWalletBalance,
  postPurchase,
  toPurchaseProvider,
  type PaymentMethod,
  type PaymentProvider,
} from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import { useAppDispatch } from '@/store/hooks';
import { hydrateSubscription } from '@/store/slices/subscriptionSlice';
import { setSubscription } from '@/store/slices/profileSlice';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { savePendingPurchase } from '@/lib/pendingPurchase';
import { parsePurchaseGate, type PurchaseGateInfo } from '@/lib/purchaseErrors';

const isWalletMethod = (method: PaymentMethod): boolean => {
  const type = (method.type ?? '').toLowerCase();
  const code = (method.code ?? '').toLowerCase();
  return type === 'wallet' || code === 'wallet';
};

function localLogoSrc(code: string): string | null {
  const c = code.trim().toLowerCase();
  if (c === 'click') return '/payments/click.svg';
  if (c === 'payme') return '/payments/payme.svg';
  if (c === 'uzum' || c === 'uzumbank' || c === 'uzum_bank') return '/payments/uzum.svg';
  return null;
}

function PaymentMethodLogo({ code, name }: { code: string; name: string }) {
  const src = localLogoSrc(code);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        height={24}
        style={{ height: 24, width: 'auto', maxWidth: 72, objectFit: 'contain', display: 'block' }}
      />
    );
  }
  return (
    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{name}</Typography>
  );
}

function PaymentRadio({ selected }: { selected: boolean }) {
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `2px solid ${selected ? colors.navy : '#D1D5DB'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {selected ? (
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors.navy }} />
      ) : null}
    </Box>
  );
}

function pickDefaultMethodId(
  paymentMethods: PaymentMethod[],
  balance: number | null,
): string | null {
  const wallet = paymentMethods.find(isWalletMethod);
  const next =
    paymentMethods.find((m) => !isWalletMethod(m) && toPurchaseProvider(m.code) != null) ??
    paymentMethods.find((m) => !isWalletMethod(m)) ??
    null;

  const walletHasFunds = balance != null && balance > 0;
  if (wallet && walletHasFunds) return wallet.id;
  if (next) return next.id;
  if (wallet) return wallet.id;
  return paymentMethods[0]?.id ?? null;
}

function CheckoutContent() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');

  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'success' | 'warning' | 'error'>('success');
  const [gate, setGate] = useState<PurchaseGateInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [offers, paymentMethods, balance] = await Promise.all([
          getPlans(),
          getPaymentMethods(),
          getWalletBalance(),
        ]);
        if (cancelled) return;
        setPlans(mapApiPlans(offers));
        setMethods(paymentMethods);
        setWalletBalance(balance);
        setSelectedMethodId(pickDefaultMethodId(paymentMethods, balance));
      } catch {
        // UI still shows plan; methods may be empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = getPlanFromList(plans, planId);

  const walletMethod = useMemo(() => methods.find(isWalletMethod) ?? null, [methods]);
  const externalMethods = useMemo(
    () =>
      methods.filter(
        (m) => !isWalletMethod(m) && toPurchaseProvider(m.code) != null,
      ),
    [methods],
  );

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? null;
  const provider: PaymentProvider | null = selectedMethod
    ? toPurchaseProvider(selectedMethod.code)
    : null;
  const isWalletSelected = Boolean(
    walletMethod && selectedMethodId === walletMethod.id,
  );
  const walletInsufficient =
    isWalletSelected &&
    plan.price > 0 &&
    (walletBalance == null || walletBalance < plan.price);

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

  const goPending = (purchaseId: string, paymentUrl?: string) => {
    // Keep URL in sessionStorage only — Payme links are long and break in query strings.
    savePendingPurchase({
      purchaseId,
      paymentUrl,
      planId: plan.id,
      provider: provider ?? undefined,
    });
    // eslint-disable-next-line no-console
    console.log('[checkout] goPending', { purchaseId, paymentUrl, provider });
    router.replace(`/payment-pending?purchaseId=${encodeURIComponent(purchaseId)}`);
  };

  const handlePay = async () => {
    if (!plan.id || paying || !provider) return;
    if (walletInsufficient) {
      setSeverity('error');
      setMessage('Недостаточно средств на кошельке');
      return;
    }
    setPaying(true);
    setMessage(null);
    setGate(null);
    try {
      const result = await postPurchase(plan.id, provider);
      const status = (result.paymentStatus ?? '').toLowerCase();
      const externalPending =
        provider !== 'wallet' &&
        Boolean(
          result.paymentUrl ||
            status === 'pending' ||
            status === 'created' ||
            (result.purchaseId && status !== 'paid' && status !== 'completed'),
        );

      // Click/Payme/Uzum: never treat current trial `subscription` as paid success.
      if (externalPending && result.purchaseId) {
        goPending(result.purchaseId, result.paymentUrl);
        return;
      }

      if (provider === 'wallet') {
        if (result.subscription || status === 'paid' || status === 'completed') {
          if (result.subscription) dispatch(setSubscription(result.subscription));
          await applyStatus();
          setSeverity('success');
          setMessage('Оплата прошла успешно!');
          setTimeout(() => router.push('/subscription'), 800);
          return;
        }
      }

      if (result.purchaseId && result.paymentUrl) {
        goPending(result.purchaseId, result.paymentUrl);
        return;
      }

      setSeverity('warning');
      setMessage('Ссылка на оплату недоступна. Попробуйте ещё раз.');
    } catch (e) {
      const gateInfo = parsePurchaseGate(e);
      if (gateInfo) {
        setGate(gateInfo);
        return;
      }
      if (e instanceof ApiError) {
        const map: Record<string, string> = {
          INSUFFICIENT_FUNDS: 'Недостаточно средств на кошельке',
          USE_TRIAL_ENDPOINT: 'Сначала активируйте пробный период',
          PLAN_NOT_AVAILABLE: 'Этот тариф недоступен',
          PLAN_NOT_PURCHASABLE: 'Этот тариф недоступен',
          PAYMENT_URL_UNAVAILABLE: 'Ссылка на оплату недоступна',
          TRIAL_ALREADY_USED: 'Пробный период уже использован',
        };
        setSeverity('error');
        setMessage(map[e.messageCode] ?? e.message);
      } else {
        setSeverity('error');
        setMessage(e instanceof Error ? e.message : 'Ошибка оплаты');
      }
    } finally {
      setPaying(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Оформление" onBack={() => router.back()} showHelp elevated />

      <Box sx={{ px: 2.5, pt: 2.5 }}>
        <Typography variant="h3" sx={{ fontSize: 18, mb: 1.5 }}>
          Способ оплаты
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: colors.navy }} />
          </Box>
        ) : methods.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
            Способы оплаты недоступны. Попробуйте позже.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {walletMethod ? (
              <ButtonBase
                onClick={() => setSelectedMethodId(walletMethod.id)}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  px: 2,
                  py: 2,
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  bgcolor: isWalletSelected ? 'rgba(27, 27, 109, 0.04)' : '#fff',
                  border: `1px solid ${isWalletSelected ? colors.navy : 'rgba(229,231,235,0.9)'}`,
                  textAlign: 'left',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(27, 27, 109, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24, color: colors.navy }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.navy }}>
                      Кошелёк
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      Баланс:{' '}
                      <Box component="span" sx={{ fontWeight: 700, color: colors.navy }}>
                        {walletBalance != null ? formatSum(walletBalance) : '—'}
                      </Box>
                    </Typography>
                  </Box>
                </Box>
                <PaymentRadio selected={isWalletSelected} />
              </ButtonBase>
            ) : null}

            {externalMethods.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {walletMethod ? (
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                    }}
                  >
                    Также с помощью
                  </Typography>
                ) : null}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {externalMethods.map((method) => {
                    const active = selectedMethodId === method.id;
                    return (
                      <ButtonBase
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        sx={{
                          minWidth: 96,
                          height: 52,
                          flexGrow: 1,
                          flexBasis: 0,
                          borderRadius: '12px',
                          px: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: active ? 'rgba(27, 27, 109, 0.04)' : '#fff',
                          border: `1px solid ${active ? colors.navy : 'rgba(229,231,235,0.9)'}`,
                        }}
                      >
                        <PaymentMethodLogo code={method.code} name={method.name} />
                      </ButtonBase>
                    );
                  })}
                </Box>
              </Box>
            ) : null}
          </Box>
        )}

        <Paper
          sx={{
            borderRadius: '16px',
            p: 2,
            mt: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            border: `1px solid ${colors.divider}`,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FEEDE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WorkspacePremiumIcon sx={{ color: colors.orangeDeep }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15.5, color: colors.heading }}>
              Premium Доступ
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {loading ? '…' : plan.label}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: colors.heading }}>
            {formatSum(plan.price)}
          </Typography>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${colors.divider}`,
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: colors.heading }}>Итого</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: colors.navy }}>
            {plan.price.toLocaleString('ru-RU').replace(/,/g, ' ')}{' '}
            <Box component="span" sx={{ fontSize: 15, fontWeight: 600 }}>
              сум
            </Box>
          </Typography>
        </Box>

        {walletInsufficient ? (
          <Typography sx={{ mt: 1.5, fontSize: 13.5, color: 'error.main' }}>
            Недостаточно средств на кошельке
          </Typography>
        ) : null}

        <PrimaryButton
          onClick={handlePay}
          disabled={paying || loading || !provider || walletInsufficient}
          sx={{ mt: 2.5, mb: 1, letterSpacing: 1.5 }}
        >
          {paying ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            'ОПЛАТИТЬ'
          )}
        </PrimaryButton>
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
          {gate?.kind === 'already_active' ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setGate(null);
                  router.push('/subscription');
                }}
                sx={{ bgcolor: colors.navy, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Статус подписки
              </Button>
              <Button
                fullWidth
                onClick={() => setGate(null)}
                sx={{ color: colors.navy, textTransform: 'none', fontWeight: 700 }}
              >
                Продолжить оплату
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setGate(null)}
                sx={{ bgcolor: colors.navy, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
              >
                Понятно
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setGate(null);
                  router.push('/premium');
                }}
                sx={{ color: colors.navy, textTransform: 'none', fontWeight: 700 }}
              >
                Выбрать другой тариф
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={severity} onClose={() => setMessage(null)} sx={{ borderRadius: 3 }}>
          {message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
