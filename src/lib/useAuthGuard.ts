'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

/** Redirects to /auth when the session is missing. Returns readiness flags. */
export function useAuthGuard() {
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const authenticated = useAppSelector((s) => s.app.authenticated);

  useEffect(() => {
    if (hydrated && !authenticated) router.replace('/auth');
  }, [hydrated, authenticated, router]);

  return { hydrated, authenticated, ready: hydrated && authenticated };
}
