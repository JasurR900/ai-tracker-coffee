'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';
import { hydrateProfile, resetProfile, setSubscription } from './slices/profileSlice';
import { hydrateMeals, clearMeals } from './slices/mealsSlice';
import { markHydrated, setAuthenticated, setNoToken, setUserMe } from './slices/appSlice';
import { hydrateSubscription, resetSubscription } from './slices/subscriptionSlice';
import { getMe, getMeals, getProfile, getSubscriptionStatus } from '@/lib/api/client';
import { onTokenChange, waitForToken } from '@/lib/api/token';
import { mergeProfileFromServer } from '@/lib/profileMerge';
import { initialProfileState } from './slices/profileSlice';
import type { SubscriptionStatusResponse } from '@/lib/api/types';

function mapSubscription(status: SubscriptionStatusResponse) {
  return {
    subscription: status.subscription ?? status.active ?? null,
    subscriptionActive: Boolean(status.access?.allowed),
    subscriptionStatus: (status.access?.allowed
      ? 'active'
      : status.subscription || status.trialUsed
        ? 'expired'
        : 'none') as 'none' | 'active' | 'expired',
    daysLeft: status.access?.daysLeft ?? status.active?.daysLeft ?? 0,
    trialUsed: Boolean(status.trialUsed),
    accessAllowed: Boolean(status.access?.allowed),
    accessCode: status.access?.code ?? 'SUBSCRIPTION_REQUIRED',
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const loaded = useRef(false);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current!;
    let cancelled = false;

    async function hydrate(token: string | null) {
      if (!token) {
        loaded.current = false;
        store.dispatch(setNoToken(true));
        store.dispatch(setAuthenticated(false));
        store.dispatch(setUserMe(null));
        store.dispatch(resetProfile());
        store.dispatch(clearMeals());
        store.dispatch(resetSubscription());
        store.dispatch(markHydrated());
        return;
      }

      try {
        store.dispatch(setAuthenticated(true));
        store.dispatch(setNoToken(false));

        const [me, profile, meals, status] = await Promise.all([
          getMe().catch(() => null),
          getProfile().catch(() => null),
          getMeals(50).catch(() => []),
          getSubscriptionStatus().catch(() => null),
        ]);

        if (cancelled) return;

        if (me) {
          store.dispatch(
            setUserMe({
              name: me.name ?? null,
              phone: me.phone ?? null,
              avatarUrl: me.avatarUrl ?? me.avatar ?? null,
            }),
          );
        }

        if (profile) {
          const current = store.getState().profile;
          const normalized = {
            ...initialProfileState,
            ...profile,
            birthDate: profile.birthDate ?? initialProfileState.birthDate,
            heightCm: profile.heightCm ?? initialProfileState.heightCm,
            weightKg: Number(profile.weightKg ?? initialProfileState.weightKg),
            subscription: profile.subscription ?? null,
            plan: profile.plan ?? null,
            autoTrackOrders: Boolean(profile.autoTrackOrders),
            onboardingCompleted: Boolean(profile.onboardingCompleted),
          };
          store.dispatch(hydrateProfile(mergeProfileFromServer(current, normalized)));
        }

        store.dispatch(hydrateMeals({ items: meals }));

        if (status) {
          const mapped = mapSubscription(status);
          store.dispatch(hydrateSubscription(mapped));
          store.dispatch(setSubscription(mapped.subscription));
        }

        loaded.current = true;
      } catch (error) {
        console.error('Failed to hydrate app state:', error);
      } finally {
        if (!cancelled) store.dispatch(markHydrated());
      }
    }

    waitForToken(4000).then((token) => {
      if (!cancelled) void hydrate(token);
    });

    const unsub = onTokenChange((token) => {
      if (cancelled) return;
      if (token) {
        loaded.current = false;
        void hydrate(token);
      } else {
        void hydrate(null);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
