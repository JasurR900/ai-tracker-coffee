'use client';

import { ApiError } from '@/lib/api/client';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/** Human-readable message for subscription API errors. */
export function subscriptionErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.statusCode !== 403) return null;
  const code = error.messageCode.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (code === 'SUBSCRIPTION_REQUIRED') {
    return 'Нужна подписка Premium, чтобы сканировать еду.';
  }
  if (code === 'SUBSCRIPTION_EXPIRED') {
    return 'Подписка истекла. Продлите Premium, чтобы продолжить.';
  }
  return null;
}

/**
 * On 403 subscription errors, replace current route with /premium
 * so Back does not return to scan/camera.
 */
export function handleSubscriptionError(error: unknown, router: AppRouterInstance): boolean {
  if (!(error instanceof ApiError) || error.statusCode !== 403) return false;
  const code = error.messageCode.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (code === 'SUBSCRIPTION_REQUIRED' || code === 'SUBSCRIPTION_EXPIRED') {
    router.replace('/premium');
    return true;
  }
  return false;
}
