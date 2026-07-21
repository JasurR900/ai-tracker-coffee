'use client';

import type { Meal, ProfileState } from '@/types';
import { getToken, notifyTokenExpired } from './token';
import { normalizePurchasePayload } from '@/lib/paymentUrl';
import {
  ApiError,
  type FoodAnalysisResponse,
  type MealsListResponse,
  type NutritionPlanOffer,
  type PaymentMethod,
  type PaymentProvider,
  type ProfileResponse,
  type PurchaseResponse,
  type PurchaseStatusResponse,
  type SubscriptionStatusResponse,
  type UploadPhotoResponse,
} from './types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://core.pointcoffee.uz').replace(/\/$/, '');

function joinUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as {
    message?: unknown;
    error?: unknown;
    code?: unknown;
    result?: { message?: unknown; code?: unknown };
  };
  if (typeof b.message === 'string' && b.message) return b.message;
  if (typeof b.code === 'string' && b.code) return b.code;
  if (typeof b.error === 'string' && b.error) return b.error;
  if (b.result && typeof b.result === 'object') {
    if (typeof b.result.message === 'string' && b.result.message) return b.result.message;
    if (typeof b.result.code === 'string' && b.result.code) return b.result.code;
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(joinUrl(path), { ...init, headers });
  const body = await parseBody(res);

  if (res.status === 401) {
    notifyTokenExpired();
    throw new ApiError(401, extractMessage(body, 'Authentication failed'));
  }

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(body, `Request failed (${res.status})`));
  }

  return body as T;
}

/* ===== Coffee user (core) ===== */

export interface MeUser {
  id?: string;
  phone?: string;
  name?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
}

/** GET /users/me — Point Coffee account (may be wrapped in { status, result }). */
export async function getMe(): Promise<MeUser | null> {
  const data = await apiFetch<MeUser | { status?: boolean; result?: MeUser | null }>('/users/me');
  if (!data || typeof data !== 'object') return null;
  if ('result' in data && 'status' in data) {
    return (data as { result?: MeUser | null }).result ?? null;
  }
  return data as MeUser;
}

/* ===== Profile ===== */

export async function getProfile(): Promise<ProfileResponse | null> {
  const data = await apiFetch<ProfileResponse | null>('/profile');
  if (data === null || (typeof data === 'object' && data && Object.keys(data).length === 0)) {
    return null;
  }
  return data;
}

export async function putProfile(profile: ProfileState): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/profile', {
    method: 'PUT',
    body: JSON.stringify({
      gender: profile.gender,
      birthDate: profile.birthDate,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      workouts: profile.workouts,
      goal: profile.goal,
      diet: profile.diet,
      plan: profile.plan,
      autoTrackOrders: profile.autoTrackOrders,
      onboardingCompleted: profile.onboardingCompleted,
    }),
  });
}

export async function deleteProfile(): Promise<void> {
  await apiFetch<void>('/profile', { method: 'DELETE' });
}

/* ===== Subscriptions ===== */

export async function getPlans(): Promise<NutritionPlanOffer[]> {
  const data = await apiFetch<NutritionPlanOffer[] | { items?: NutritionPlanOffer[] }>(
    '/nutrition/plans',
  );
  const list = Array.isArray(data) ? data : (data.items ?? []);
  return list.filter((p) => p.isActive !== false);
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  return apiFetch<SubscriptionStatusResponse>('/nutrition/subscriptions/status');
}

export async function postTrial(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/nutrition/subscriptions/trial', { method: 'POST' });
}

export async function postPurchase(
  planId: string,
  provider: PaymentProvider,
): Promise<PurchaseResponse> {
  const raw = await apiFetch<Record<string, unknown>>('/nutrition/subscriptions/purchase', {
    method: 'POST',
    body: JSON.stringify({ planId, provider }),
  });
  // eslint-disable-next-line no-console
  console.log('[purchase] raw response', provider, raw);
  const normalized = normalizePurchasePayload(raw);
  // eslint-disable-next-line no-console
  console.log('[purchase] normalized', {
    provider,
    purchaseId: normalized.purchaseId,
    paymentUrl: normalized.paymentUrl,
    paymentStatus: normalized.paymentStatus,
    keys: Object.keys(raw ?? {}),
  });
  return normalized as unknown as PurchaseResponse;
}

export async function getPurchase(purchaseId: string): Promise<PurchaseStatusResponse> {
  const raw = await apiFetch<Record<string, unknown>>(
    `/nutrition/subscriptions/purchases/${encodeURIComponent(purchaseId)}`,
  );
  // eslint-disable-next-line no-console
  console.log('[purchase/status] raw', purchaseId, raw);
  return normalizePurchasePayload(raw) as unknown as PurchaseStatusResponse;
}

/* ===== Payments (core API — same as coffee-mobile-app) ===== */

function unwrapListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.result)) return o.result;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function parsePaymentMethod(raw: unknown): PaymentMethod | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : null;
  const code = typeof o.code === 'string' ? o.code.trim().toLowerCase() : '';
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  if (!id || !code || !name) return null;
  return {
    id,
    code,
    name,
    type: typeof o.type === 'string' ? o.type.trim().toLowerCase() : code,
    iconUrl:
      (typeof o.iconUrl === 'string' && o.iconUrl) ||
      (typeof o.icon_url === 'string' && o.icon_url) ||
      (typeof o.icon === 'string' && o.icon) ||
      null,
    isActive: o.isActive !== false && o.is_active !== false,
    sortOrder: typeof o.sortOrder === 'number' ? o.sortOrder : typeof o.sort_order === 'number' ? o.sort_order : 0,
  };
}

/** GET /payments/methods — maps to checkout providers (wallet / click / payme / uzum). */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const data = await apiFetch<unknown>('/payments/methods');
  return unwrapListPayload(data)
    .map(parsePaymentMethod)
    .filter((m): m is PaymentMethod => m != null && m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Map payment method code → nutrition purchase `provider`. */
export function toPurchaseProvider(code: string): PaymentProvider | null {
  const c = code.trim().toLowerCase();
  if (c === 'wallet' || c === 'balance' || c === 'coffeebank') return 'wallet';
  if (c === 'click') return 'click';
  if (c === 'payme') return 'payme';
  if (c === 'uzum' || c === 'uzumbank' || c === 'uzum_bank') return 'uzum';
  return null;
}

/** GET /wallet — balance for wallet payment row (optional). */
export async function getWalletBalance(): Promise<number | null> {
  try {
    const data = await apiFetch<unknown>('/wallet');
    const raw =
      data && typeof data === 'object' && 'result' in data
        ? (data as { result: unknown }).result
        : data && typeof data === 'object' && 'data' in data
          ? (data as { data: unknown }).data
          : data;
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const bal = o.balance ?? o.availableBalance ?? o.available_balance;
    if (typeof bal === 'number' && Number.isFinite(bal)) return bal;
    if (typeof bal === 'string' && bal.trim() !== '') {
      const n = Number(bal);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

/* ===== Meals ===== */

export async function getMeals(limit = 50): Promise<Meal[]> {
  const data = await apiFetch<MealsListResponse | Meal[]>(`/meals?limit=${limit}`);
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

export async function postMeal(
  meal: Omit<Meal, 'id' | 'createdAt'> & { createdAt?: string },
): Promise<Meal> {
  const { createdAt, ...rest } = meal;
  return apiFetch<Meal>('/meals', {
    method: 'POST',
    body: JSON.stringify({
      ...rest,
      ...(createdAt ? { createdAt } : {}),
    }),
  });
}

export async function patchMeal(
  id: string,
  fields: Pick<Meal, 'name' | 'calories' | 'protein' | 'fats' | 'carbs' | 'description'>,
): Promise<Meal> {
  return apiFetch<Meal>(`/meals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteMeal(id: string): Promise<void> {
  await apiFetch<void>(`/meals/${id}`, { method: 'DELETE' });
}

export async function deleteAllMeals(): Promise<void> {
  await apiFetch<void>('/meals', { method: 'DELETE' });
}

/* ===== Upload ===== */

export async function uploadMealPhoto(dataUrlOrBlob: string | Blob): Promise<string | null> {
  try {
    let blob: Blob;
    if (typeof dataUrlOrBlob === 'string') {
      blob = await (await fetch(dataUrlOrBlob)).blob();
    } else {
      blob = dataUrlOrBlob;
    }
    const form = new FormData();
    form.append('file', blob, `meal-${Date.now()}.jpg`);
    const data = await apiFetch<UploadPhotoResponse>('/upload/meal-photo', {
      method: 'POST',
      body: form,
    });
    return data.url ?? null;
  } catch {
    return null;
  }
}

/* ===== Analyze ===== */

export async function analyze(
  input: { image: string } | { text: string },
): Promise<FoodAnalysisResponse> {
  return apiFetch<FoodAnalysisResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export { ApiError };
export type {
  FoodAnalysisResponse,
  NutritionPlanOffer,
  PaymentMethod,
  PaymentProvider,
  ProfileResponse,
  PurchaseResponse,
  SubscriptionStatusResponse,
};
