'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { useAppDispatch, useAppStore } from '@/store/hooks';
import { addMeal } from '@/store/slices/mealsSlice';
import { insertMeal } from '@/lib/supabase/db';
import { useAuthGuard } from '@/lib/useAuthGuard';
import type { FoodAnalysis } from '@/types';

const EXAMPLES = ['Плов, большая порция', 'Латте с сиропом 400 мл', '2 яйца и тост с маслом'];

export default function AddTextPage() {
  const router = useRouter();
  useAuthGuard();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = (await res.json()) as FoodAnalysis & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Не удалось проанализировать описание');
      if (!data.isFood) {
        setError('Не удалось распознать еду в описании. Уточните, что вы съели.');
        setLoading(false);
        return;
      }
      const userId = store.getState().app.userId;
      if (!userId) {
        router.push('/auth');
        return;
      }
      const meal = await insertMeal(userId, {
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fats: data.fats,
        carbs: data.carbs,
        description: data.description,
        photo: null,
      });
      dispatch(addMeal(meal));
      router.push(`/food/${meal.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка анализа. Попробуйте ещё раз.');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Добавить текстом" onBack={() => router.back()} elevated />

      <Box sx={{ px: 2.5, pt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h2" sx={{ fontSize: 22, mb: 1 }}>
          Опишите, что вы съели
        </Typography>
        <Typography sx={{ fontSize: 14.5, color: 'text.secondary', mb: 2.5, lineHeight: 1.45 }}>
          ИИ определит блюдо и рассчитает калории и КБЖУ по вашему описанию.
        </Typography>

        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Например: плов, большая порция"
          fullWidth
          multiline
          minRows={4}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: '#fff',
              fontSize: 15.5,
              '& fieldset': { borderColor: '#E4E5EC' },
              '&:hover fieldset': { borderColor: '#C9CBD6' },
              '&.Mui-focused fieldset': { borderColor: colors.navy },
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {EXAMPLES.map((example) => (
            <Box
              key={example}
              onClick={() => setText(example)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '10px',
                bgcolor: '#fff',
                border: `1px solid ${colors.divider}`,
                fontSize: 13,
                fontWeight: 600,
                color: '#5A5D6E',
                cursor: 'pointer',
                '&:hover': { borderColor: colors.navy },
              }}
            >
              {example}
            </Box>
          ))}
        </Box>

        <PrimaryButton
          onClick={handleAnalyze}
          disabled={!text.trim() || loading}
          startIcon={!loading ? <AutoFixHighIcon /> : undefined}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Проанализировать'}
        </PrimaryButton>
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
