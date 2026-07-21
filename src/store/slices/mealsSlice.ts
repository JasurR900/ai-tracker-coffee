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
    updateMeal: (state, action: PayloadAction<{ id: string; changes: Partial<Meal> }>) => {
      const meal = state.items.find((m) => m.id === action.payload.id);
      if (meal) Object.assign(meal, action.payload.changes);
    },
    removeMeal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    clearMeals: () => initialMealsState,
  },
});

export const { hydrateMeals, addMeal, updateMeal, removeMeal, clearMeals } = mealsSlice.actions;
export default mealsSlice.reducer;
