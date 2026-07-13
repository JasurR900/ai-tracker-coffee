import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import mealsReducer from './slices/mealsSlice';
import appReducer from './slices/appSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      profile: profileReducer,
      meals: mealsReducer,
      app: appReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
