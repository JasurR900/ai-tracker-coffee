'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ButtonBase from '@mui/material/ButtonBase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { formatSum } from '@/lib/format';
import { getPlan } from '@/lib/premium';

const COUPONS = [
  { id: 'sub', label: 'Подписка AI Трекер Калорий на 3 МЕСЯЦА' },
  { id: 'drink', label: 'Купон на бесплатный напиток' },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = getPlan(searchParams.get('plan'));
  const [coupon, setCoupon] = useState('sub');
  const [paid, setPaid] = useState(false);

  return (
    <AppShell>
      <PageHeader title="Оформление" onBack={() => router.back()} showHelp elevated />

      <Box sx={{ px: 2.5, pt: 2.5 }}>
        <Typography variant="h3" sx={{ fontSize: 18, mb: 1.5 }}>
          Способ оплаты
        </Typography>

        <Paper
          sx={{
            borderRadius: '16px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            border: `1.5px solid ${colors.divider}`,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EEEFF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.navy,
            }}
          >
            <AccountBalanceWalletOutlinedIcon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15.5, color: colors.heading }}>
              Кошелек приложения
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Баланс:{' '}
              <Box component="span" sx={{ color: colors.navy, fontWeight: 700 }}>
                {formatSum(25000)}
              </Box>
            </Typography>
          </Box>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: `2px solid ${colors.navy}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: colors.navy }} />
          </Box>
        </Paper>

        <Typography
          sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#9C9FAD', mt: 2.5, mb: 1.25 }}
        >
          ТАКЖЕ С ПОМОЩЬЮ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          {/* payment logos rendered as stylised wordmarks */}
          <Paper
            sx={{
              flex: 1,
              borderRadius: '12px',
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${colors.divider}`,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#33CCC2' }}>
              <Box component="span" sx={{ color: '#7A7A7A' }}>
                Pay
              </Box>
              me
            </Typography>
          </Paper>
          <Paper
            sx={{
              flex: 1,
              borderRadius: '12px',
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              border: `1px solid ${colors.divider}`,
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: '#0091EA',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              c
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#1A1A2E' }}>click</Typography>
          </Paper>
          <Paper
            sx={{
              flex: 1,
              borderRadius: '12px',
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.6,
              border: `1px solid ${colors.divider}`,
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: '#7000FF',
                color: '#fff',
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              U
            </Box>
            <Box sx={{ lineHeight: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#7000FF', lineHeight: 1 }}>
                uzum
              </Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#7000FF', lineHeight: 1.2 }}>
                bank
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Typography variant="h3" sx={{ fontSize: 18, mt: 3, mb: 1.5 }}>
          Используйте купон или абонимент ?
        </Typography>

        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${colors.divider}` }}>
          <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${colors.divider}` }}>
            <Typography sx={{ fontSize: 14.5, color: '#B4B7C3' }}>Мои купоны и абонименты</Typography>
          </Box>
          {COUPONS.map((c) => {
            const active = coupon === c.id;
            return (
              <ButtonBase
                key={c.id}
                onClick={() => setCoupon(c.id)}
                sx={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  px: active ? 1 : 2,
                  py: active ? 0.75 : 0,
                }}
              >
                <Box
                  sx={{
                    px: active ? 1.5 : 0,
                    py: 1.25,
                    borderRadius: active ? '10px' : 0,
                    bgcolor: active ? colors.navy : 'transparent',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      fontWeight: active ? 700 : 500,
                      color: active ? '#fff' : colors.heading,
                    }}
                  >
                    {c.label}
                  </Typography>
                </Box>
              </ButtonBase>
            );
          })}
          <Box sx={{ height: 8 }} />
        </Paper>

        {/* selected subscription */}
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
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{plan.label}</Typography>
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

        <PrimaryButton onClick={() => setPaid(true)} sx={{ mt: 2.5, mb: 1, letterSpacing: 1.5 }}>
          ОПЛАТИТЬ
        </PrimaryButton>
      </Box>

      <Snackbar
        open={paid}
        autoHideDuration={3500}
        onClose={() => setPaid(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setPaid(false)} sx={{ borderRadius: 3 }}>
          Оплата прошла успешно! (демо-режим)
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
