import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  hydrated: boolean;
  authenticated: boolean;
  userId: string | null;
  username: string | null;
}

const initialState: AppState = {
  hydrated: false,
  authenticated: false,
  userId: null,
  username: null,
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
      action: PayloadAction<{ userId: string; username: string | null } | null>,
    ) => {
      state.authenticated = action.payload !== null;
      state.userId = action.payload?.userId ?? null;
      state.username = action.payload?.username ?? null;
    },
  },
});

export const { markHydrated, setAuth } = appSlice.actions;
export default appSlice.reducer;
