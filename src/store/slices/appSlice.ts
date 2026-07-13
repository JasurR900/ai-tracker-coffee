import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  hydrated: boolean;
}

const initialState: AppState = { hydrated: false };

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    markHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const { markHydrated } = appSlice.actions;
export default appSlice.reducer;
