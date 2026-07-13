import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import mealsReducer from './slices/mealsSlice';
import appReducer from './slices/appSlice';
import { saveMeals, saveProfile } from '@/lib/storage';

export function makeStore() {
  const store = configureStore({
    reducer: {
      profile: profileReducer,
      meals: mealsReducer,
      app: appReducer,
    },
  });

  if (typeof window !== 'undefined') {
    let prevProfile = store.getState().profile;
    let prevMeals = store.getState().meals;
    store.subscribe(() => {
      const { profile, meals, app } = store.getState();
      if (!app.hydrated) return;
      if (profile !== prevProfile) {
        prevProfile = profile;
        saveProfile(profile);
      }
      if (meals !== prevMeals) {
        prevMeals = meals;
        saveMeals(meals);
      }
    });
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
