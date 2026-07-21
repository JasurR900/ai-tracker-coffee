/** Extract & validate provider checkout URL from purchase API payloads. */

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export function extractPaymentUrl(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const direct =
    asString(o.paymentUrl) ??
    asString(o.payment_url) ??
    asString(o.redirectUrl) ??
    asString(o.redirect_url) ??
    asString(o.paymentRedirectUrl) ??
    asString(o.checkoutUrl) ??
    asString(o.checkout_url) ??
    asString(o.url) ??
    asString(o.link);

  if (direct) return direct;

  const payment = o.payment;
  if (payment && typeof payment === 'object') {
    const p = payment as Record<string, unknown>;
    return (
      asString(p.paymentUrl) ??
      asString(p.payment_url) ??
      asString(p.redirectUrl) ??
      asString(p.url)
    );
  }

  const result = o.result;
  if (result && typeof result === 'object') {
    return extractPaymentUrl(result);
  }

  return undefined;
}

/** Only real https payment hosts — never open app deep links as checkout. */
export function isSafePaymentUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();
    // Block our site / deep-link hosts only — t.me/pointcoffeeuz is NOT a payment URL
    // but must not be rejected here when reused carefully. For payments, reject app hosts.
    if (host === 'pointcoffee.uz' || host === 'www.pointcoffee.uz' || host === 'core.pointcoffee.uz') {
      return false;
    }
    if (host === 't.me' || host === 'telegram.me') return false;
    return true;
  } catch {
    return false;
  }
}

export function normalizePurchasePayload<T extends Record<string, unknown>>(raw: T): T & {
  paymentUrl?: string;
  purchaseId?: string;
} {
  const paymentUrl = extractPaymentUrl(raw);
  const purchaseId =
    asString(raw.purchaseId) ?? asString(raw.purchase_id) ?? asString(raw.id);
  return {
    ...raw,
    ...(purchaseId ? { purchaseId } : {}),
    ...(paymentUrl ? { paymentUrl } : {}),
  };
}
