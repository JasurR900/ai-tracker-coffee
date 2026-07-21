import { ApiError } from '@/lib/api/types';

export type PurchaseGateKind = 'wait' | 'already_active' | 'generic';

export type PurchaseGateInfo = {
  kind: PurchaseGateKind;
  title: string;
  body: string;
  /** Remaining days parsed from backend message, if any */
  daysLeft?: number;
};

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function extractDays(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(?:дн|день|дня|дней|kun|day|days)/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

/** Map purchase/trial API errors → modal copy (marketing-friendly). */
export function parsePurchaseGate(error: unknown): PurchaseGateInfo | null {
  if (!(error instanceof ApiError)) return null;
  const code = normalizeCode(error.messageCode || error.message);
  const raw = error.message || code;
  const days = extractDays(raw);

  if (
    code.includes('PURCHASE_NOT_ALLOWED') ||
    code.includes('PURCHASE_LOCKED') ||
    code.includes('TRIAL_ACTIVE') ||
    code.includes('WAIT') ||
    (days != null && (code.includes('TRIAL') || code.includes('FREE')))
  ) {
    return {
      kind: 'wait',
      title: 'Оплата пока недоступна',
      body:
        days != null
          ? `Пробный период ещё активен. Оформить платную подписку можно через ${days} дн. после окончания бесплатного периода — либо продлите сейчас, если доступно.`
          : 'Пробный период ещё активен. Платную подписку можно оформить после его окончания, либо выберите продление, если сервер это разрешает.',
      daysLeft: days,
    };
  }

  if (code === 'SUBSCRIPTION_ALREADY_ACTIVE') {
    return {
      kind: 'already_active',
      title: 'Подписка уже активна',
      body: 'У вас уже есть активный доступ (например, пробный период). Оплата продлит подписку после текущей даты окончания.',
      daysLeft: days,
    };
  }

  return null;
}
