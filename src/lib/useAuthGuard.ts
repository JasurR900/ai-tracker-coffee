'use client';

import { useAppSelector } from '@/store/hooks';

/**
 * Auth guard for WebView-only usage.
 * Returns readiness flags — does not redirect to a login page
 * (JWT comes from the native coffee app).
 */
export function useAuthGuard() {
  const hydrated = useAppSelector((s) => s.app.hydrated);
  const authenticated = useAppSelector((s) => s.app.authenticated);
  const noToken = useAppSelector((s) => s.app.noToken);

  return {
    hydrated,
    authenticated,
    noToken,
    ready: hydrated && authenticated,
  };
}
