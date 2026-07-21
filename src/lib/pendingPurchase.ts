export type PendingPurchaseStore = {
  purchaseId: string;
  paymentUrl?: string;
  planId?: string;
  provider?: string;
};

const PENDING_KEY = 'calai:pendingPurchase';

export function savePendingPurchase(data: PendingPurchaseStore) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadPendingPurchase(): PendingPurchaseStore | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchaseStore;
    if (!parsed?.purchaseId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPurchase() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}
