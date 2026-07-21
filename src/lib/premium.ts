import type { NutritionPlanOffer } from '@/lib/api/types';
import type { Subscription } from '@/types';

export type PremiumPlan = {
  id: string;
  label: string;
  price: number;
  days: number;
  statusLabel: string;
  isTrial: boolean;
  badge?: 'ПОПУЛЯРНЫЙ ВЫБОР' | 'ЛУЧШАЯ ЦЕНА';
};

/** Map API plan offers into UI plan cards. */
export function mapApiPlans(offers: NutritionPlanOffer[]): PremiumPlan[] {
  return offers
    .filter((p) => !p.isTrial)
    .map((p, index, arr) => {
      let badge: PremiumPlan['badge'];
      if (p.planId === 'month' || (arr.length > 1 && index === 0 && p.planId !== 'year')) {
        badge = p.planId === 'month' ? 'ПОПУЛЯРНЫЙ ВЫБОР' : undefined;
      }
      if (p.planId === 'year') badge = 'ЛУЧШАЯ ЦЕНА';
      return {
        id: p.planId,
        label: p.label,
        price: p.price,
        days: p.durationDays,
        statusLabel: p.statusLabel,
        isTrial: Boolean(p.isTrial),
        badge,
      };
    });
}

export function getPlanFromList(plans: PremiumPlan[], id: string | null): PremiumPlan {
  return plans.find((p) => p.id === id) ?? plans[0] ?? {
    id: 'month',
    label: '1 месяц',
    price: 15000,
    days: 30,
    statusLabel: 'Месячный',
    isTrial: false,
  };
}

export function subscriptionDaysLeft(sub: Subscription, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / 86400000));
}
