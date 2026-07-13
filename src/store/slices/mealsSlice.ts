import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Meal, MealsState } from '@/types';

const MAX_MEALS = 30;

export const initialMealsState: MealsState = {
  items: [],
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState: initialMealsState,
  reducers: {
    hydrateMeals: (_state, action: PayloadAction<MealsState>) => action.payload,
    addMeal: (state, action: PayloadAction<Meal>) => {
      state.items.unshift(action.payload);
      if (state.items.length > MAX_MEALS) state.items.length = MAX_MEALS;
    },
    removeMeal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    clearMeals: () => initialMealsState,
  },
});

export const { hydrateMeals, addMeal, removeMeal, clearMeals } = mealsSlice.actions;
export default mealsSlice.reducer;
