import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  BirthDate,
  Diet,
  Gender,
  Goal,
  NutritionPlan,
  ProfileState,
  Subscription,
  Workouts,
} from '@/types';

export const initialProfileState: ProfileState = {
  subscription: null,
  gender: null,
  birthDate: { year: 2000, month: 0, day: 1 },
  heightCm: 170,
  weightKg: 70,
  workouts: null,
  goal: null,
  diet: null,
  onboardingCompleted: false,
  plan: null,
  autoTrackOrders: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {
    hydrateProfile: (_state, action: PayloadAction<ProfileState>) => action.payload,
    setGender: (state, action: PayloadAction<Gender>) => {
      state.gender = action.payload;
    },
    setBirthDate: (state, action: PayloadAction<BirthDate>) => {
      state.birthDate = action.payload;
    },
    setHeight: (state, action: PayloadAction<number>) => {
      state.heightCm = action.payload;
    },
    setWeight: (state, action: PayloadAction<number>) => {
      state.weightKg = action.payload;
    },
    setWorkouts: (state, action: PayloadAction<Workouts>) => {
      state.workouts = action.payload;
    },
    setGoal: (state, action: PayloadAction<Goal>) => {
      state.goal = action.payload;
    },
    setDiet: (state, action: PayloadAction<Diet>) => {
      state.diet = action.payload;
    },
    setPlan: (state, action: PayloadAction<NutritionPlan>) => {
      state.plan = action.payload;
      state.onboardingCompleted = true;
    },
    updatePlan: (state, action: PayloadAction<NutritionPlan>) => {
      state.plan = action.payload;
    },
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
    },
    setAutoTrackOrders: (state, action: PayloadAction<boolean>) => {
      state.autoTrackOrders = action.payload;
    },
    resetProfile: () => initialProfileState,
  },
});

export const {
  hydrateProfile,
  setGender,
  setBirthDate,
  setHeight,
  setWeight,
  setWorkouts,
  setGoal,
  setDiet,
  setPlan,
  updatePlan,
  setSubscription,
  setAutoTrackOrders,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
