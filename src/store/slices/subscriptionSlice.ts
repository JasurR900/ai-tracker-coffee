import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Subscription } from '@/types';
import type { AccessCode, SubscriptionStatusCode } from '@/lib/api/types';

export interface SubscriptionState {
  subscription: Subscription | null;
  subscriptionActive: boolean;
  subscriptionStatus: SubscriptionStatusCode;
  daysLeft: number;
  trialUsed: boolean;
  accessAllowed: boolean;
  accessCode: AccessCode;
}

export const initialSubscriptionState: SubscriptionState = {
  subscription: null,
  subscriptionActive: false,
  subscriptionStatus: 'none',
  daysLeft: 0,
  trialUsed: false,
  accessAllowed: false,
  accessCode: 'SUBSCRIPTION_REQUIRED',
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: initialSubscriptionState,
  reducers: {
    hydrateSubscription: (_state, action: PayloadAction<SubscriptionState>) => action.payload,
    resetSubscription: () => initialSubscriptionState,
  },
});

export const { hydrateSubscription, resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
