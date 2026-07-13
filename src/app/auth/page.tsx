'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { AppShell } from '@/components/layout/AppShell';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors } from '@/theme/theme';
import { getSupabase } from '@/lib/supabase/client';
import { usernameToEmail, USERNAME_RE } from '@/lib/username';
import { useAppSelector } from '@/store/hooks';

type Mode = 'login' | 'register';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#E4E5EC' },
    '&:hover fieldset': { borderColor: '#C9CBD6' },
    '&.Mui-focused fieldset': { borderColor: colors.navy },
  },
};

export default function AuthPage() {
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const authenticated = useAppSelector((s) => s.app.authenticated);
  const onboardingCompleted = useAppSelector((s) => s.profile.onboardingCompleted);

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && authenticated) {
      router.replace(onboardingCompleted ? '/dashboard' : '/onboarding/1');
    }
  }, [hydrated, authenticated, onboardingCompleted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanUsername = username.trim().toLowerCase();
      if (!USERNAME_RE.test(cleanUsername)) {
        throw new Error('Имя пользователя: 3–20 символов, только латинские буквы, цифры и _');
      }
      const supabase = getSupabase();
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Не удалось создать аккаунт');
        }
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(cleanUsername),
        password,
      });
      if (signInError) {
        throw new Error(
          /invalid/i.test(signInError.message)
            ? 'Неверное имя пользователя или пароль'
            : signInError.message,
        );
      }
      // redirect happens via the authenticated effect above
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Box
        sx={{
          py: 2,
          textAlign: 'center',
          bgcolor: '#FAFAFC',
          borderBottom: '1px solid #ECEDF2',
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary' }}>
          Счётчик калорий
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3 }}
      >
        <Typography variant="h1" sx={{ textAlign: 'center', fontSize: 26, mb: 1 }}>
          {mode === 'login' ? 'С возвращением!' : 'Создайте аккаунт'}
        </Typography>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 15, mb: 4 }}>
          {mode === 'login'
            ? 'Войдите, чтобы продолжить трекинг'
            : 'Данные и приёмы пищи будут сохраняться в вашем профиле'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          autoComplete="username"
          slotProps={{ htmlInput: { maxLength: 20, autoCapitalize: 'none', autoCorrect: 'off' } }}
          sx={{ ...fieldSx, mb: 2 }}
        />
        <TextField
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          slotProps={{ htmlInput: { minLength: 6 } }}
          sx={{ ...fieldSx, mb: 3 }}
        />

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : mode === 'login' ? (
            'Войти'
          ) : (
            'Зарегистрироваться'
          )}
        </PrimaryButton>

        <Button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
          sx={{ mt: 2, color: colors.navy, fontWeight: 700, fontSize: 14.5 }}
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </Button>
      </Box>
    </AppShell>
  );
}
