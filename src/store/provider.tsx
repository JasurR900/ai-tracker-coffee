'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';
import { hydrateProfile } from './slices/profileSlice';
import { hydrateMeals } from './slices/mealsSlice';
import { markHydrated } from './slices/appSlice';
import { loadMeals, loadProfile } from '@/lib/storage';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store || store.getState().app.hydrated) return;
    const profile = loadProfile();
    const meals = loadMeals();
    if (profile) store.dispatch(hydrateProfile(profile));
    if (meals) store.dispatch(hydrateMeals(meals));
    store.dispatch(markHydrated());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
