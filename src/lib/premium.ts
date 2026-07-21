import type { Subscription } from '@/types';

export interface PremiumPlan {
  id: string;
  label: string;
  price: number;
  days: number;
  statusLabel: string;
  badge?: 'ПОПУЛЯРНЫЙ ВЫБОР' | 'ЛУЧШАЯ ЦЕНА';
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  { id: 'week', label: '1 неделя', price: 10000, days: 7, statusLabel: 'Недельный' },
  {
    id: 'month',
    label: '1 месяц',
    price: 25000,
    days: 30,
    statusLabel: 'Месячный',
    badge: 'ПОПУЛЯРНЫЙ ВЫБОР',
  },
  { id: 'quarter', label: '3 месяца', price: 75000, days: 90, statusLabel: 'Квартальный' },
  {
    id: 'year',
    label: '12 месяцев',
    price: 200000,
    days: 365,
    statusLabel: 'Годовой',
    badge: 'ЛУЧШАЯ ЦЕНА',
  },
];

export function getPlan(id: string | null): PremiumPlan {
  return PREMIUM_PLANS.find((p) => p.id === id) ?? PREMIUM_PLANS[1];
}

export function createSubscription(plan: PremiumPlan, now = new Date()): Subscription {
  const expires = new Date(now);
  expires.setDate(expires.getDate() + plan.days);
  return {
    planId: plan.id,
    label: plan.statusLabel,
    paidAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export function subscriptionDaysLeft(sub: Subscription, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / 86400000));
}
