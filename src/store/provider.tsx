'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import type { Session } from '@supabase/supabase-js';
import { makeStore, type AppStore } from './index';
import { hydrateProfile, resetProfile } from './slices/profileSlice';
import { hydrateMeals, clearMeals } from './slices/mealsSlice';
import { markHydrated, setAuth } from './slices/appSlice';
import { getSupabase } from '@/lib/supabase/client';
import { fetchMeals, fetchProfile } from '@/lib/supabase/db';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const loadedUserId = useRef<string | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current!;
    const supabase = getSupabase();

    async function loadForSession(session: Session | null) {
      if (!session) {
        loadedUserId.current = null;
        store.dispatch(setAuth(null));
        store.dispatch(resetProfile());
        store.dispatch(clearMeals());
        store.dispatch(markHydrated());
        return;
      }
      const userId = session.user.id;
      if (loadedUserId.current === userId) return;
      loadedUserId.current = userId;
      store.dispatch(setAuth({ userId, email: session.user.email ?? null }));
      const [profile, meals] = await Promise.all([fetchProfile(userId), fetchMeals(userId)]);
      if (profile) store.dispatch(hydrateProfile(profile));
      store.dispatch(hydrateMeals({ items: meals }));
      store.dispatch(markHydrated());
    }

    supabase.auth.getSession().then(({ data }) => loadForSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        void loadForSession(session);
      } else if (event === 'SIGNED_OUT') {
        void loadForSession(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
