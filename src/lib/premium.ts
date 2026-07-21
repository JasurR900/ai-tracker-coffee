export interface PremiumPlan {
  id: string;
  label: string;
  price: number;
  badge?: 'ПОПУЛЯРНЫЙ ВЫБОР' | 'ЛУЧШАЯ ЦЕНА';
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  { id: 'week', label: '1 неделя', price: 10000 },
  { id: 'month', label: '1 месяц', price: 25000, badge: 'ПОПУЛЯРНЫЙ ВЫБОР' },
  { id: 'quarter', label: '3 месяца', price: 75000 },
  { id: 'year', label: '12 месяцев', price: 200000, badge: 'ЛУЧШАЯ ЦЕНА' },
];

export function getPlan(id: string | null): PremiumPlan {
  return PREMIUM_PLANS.find((p) => p.id === id) ?? PREMIUM_PLANS[1];
}
