import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  hydrated: boolean;
  authenticated: boolean;
  noToken: boolean;
  /** From GET /users/me */
  userName: string | null;
  userPhone: string | null;
  userAvatarUrl: string | null;
}

const initialState: AppState = {
  hydrated: false,
  authenticated: false,
  noToken: false,
  userName: null,
  userPhone: null,
  userAvatarUrl: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    markHydrated: (state) => {
      state.hydrated = true;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
      if (action.payload) state.noToken = false;
    },
    setNoToken: (state, action: PayloadAction<boolean>) => {
      state.noToken = action.payload;
      if (action.payload) {
        state.authenticated = false;
        state.userName = null;
        state.userPhone = null;
        state.userAvatarUrl = null;
      }
    },
    setUserMe: (
      state,
      action: PayloadAction<{
        name?: string | null;
        phone?: string | null;
        avatarUrl?: string | null;
      } | null>,
    ) => {
      if (!action.payload) {
        state.userName = null;
        state.userPhone = null;
        state.userAvatarUrl = null;
        return;
      }
      state.userName = action.payload.name?.trim() || null;
      state.userPhone = action.payload.phone?.trim() || null;
      state.userAvatarUrl = action.payload.avatarUrl?.trim() || null;
    },
  },
});

export const { markHydrated, setAuthenticated, setNoToken, setUserMe } = appSlice.actions;
export default appSlice.reducer;
