'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MacroIcon, type MacroKind } from '@/components/ui/MacroIcon';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import { updatePlan } from '@/store/slices/profileSlice';
import { upsertProfile } from '@/lib/supabase/db';
import { useAuthGuard } from '@/lib/useAuthGuard';

const FIELDS: Array<{ key: 'calories' | 'protein' | 'carbs' | 'fats'; label: string; icon: MacroKind }> = [
  { key: 'calories', label: 'Целевая калорийность', icon: 'flame' },
  { key: 'protein', label: 'Цель по белкам, г', icon: 'protein' },
  { key: 'carbs', label: 'Цель по углеводам, г', icon: 'carbs' },
  { key: 'fats', label: 'Цель по жирам, г', icon: 'fats' },
];

export default function GoalsPage() {
  const router = useRouter();
  const { ready } = useAuthGuard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const plan = useAppSelector((s) => s.profile.plan);

  const [values, setValues] = useState({ calories: '', protein: '', carbs: '', fats: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setValues({
        calories: String(plan.calories),
        protein: String(plan.protein),
        carbs: String(plan.carbs),
        fats: String(plan.fats),
      });
    }
  }, [plan]);

  useEffect(() => {
    if (ready && !plan) router.replace('/onboarding/1');
  }, [ready, plan, router]);

  const handleSave = async () => {
    const num = (v: string) => Math.max(0, Math.round(Number(v.replace(',', '.')) || 0));
    const newPlan = {
      calories: num(values.calories),
      protein: num(values.protein),
      carbs: num(values.carbs),
      fats: num(values.fats),
    };
    setSaving(true);
    dispatch(updatePlan(newPlan));
    const { profile, app } = store.getState();
    if (app.userId) {
      await upsertProfile(app.userId, profile, app.username).catch(() => undefined);
    }
    router.push('/dashboard');
  };

  return (
    <AppShell>
      <PageHeader title="Настроить цели" onClose={() => router.push('/dashboard')} elevated />

      <Box sx={{ px: 2.5, pt: 3, flex: 1 }}>
        <Paper sx={{ borderRadius: '18px', px: 2.5, py: 1 }}>
          {FIELDS.map(({ key, label, icon }, i) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                py: 1.75,
                borderBottom: i < FIELDS.length - 1 ? `1px solid ${colors.divider}` : 'none',
              }}
            >
              <ProgressRing size={44} strokeWidth={3} progress={1} color="#E4E5EC">
                <MacroIcon kind={icon} size={18} />
              </ProgressRing>
              <Typography sx={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: colors.heading }}>
                {label}
              </Typography>
              <TextField
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                size="small"
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    style: { textAlign: 'right', fontWeight: 800, fontSize: 16 },
                  },
                }}
                sx={{
                  width: 90,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F7F7FA',
                    '& fieldset': { borderColor: '#E4E5EC' },
                    '&.Mui-focused fieldset': { borderColor: colors.navy },
                  },
                }}
              />
            </Box>
          ))}
        </Paper>

        <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#B4B7C3', mt: 2 }}>
          Цели рассчитаны по формуле Миффлина—Сан Жеора на основе ваших данных.
          Вы можете изменить их вручную.
        </Typography>

        <PrimaryButton onClick={handleSave} disabled={saving} sx={{ mt: 3 }}>
          {saving ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Сохранить'}
        </PrimaryButton>
      </Box>
    </AppShell>
  );
}
