import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  hydrated: boolean;
  authenticated: boolean;
  userId: string | null;
  email: string | null;
}

const initialState: AppState = {
  hydrated: false,
  authenticated: false,
  userId: null,
  email: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    markHydrated: (state) => {
      state.hydrated = true;
    },
    setAuth: (
      state,
      action: PayloadAction<{ userId: string; email: string | null } | null>,
    ) => {
      state.authenticated = action.payload !== null;
      state.userId = action.payload?.userId ?? null;
      state.email = action.payload?.email ?? null;
    },
  },
});

export const { markHydrated, setAuth } = appSlice.actions;
export default appSlice.reducer;
