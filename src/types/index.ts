export type Gender = 'male' | 'female';
export type Workouts = '0-2' | '3-5' | '6+';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Diet = 'classic' | 'vegan' | 'keto' | 'paleo';

export interface BirthDate {
  year: number;
  month: number; // 0-11
  day: number; // 1-31
}

export interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ProfileState {
  gender: Gender | null;
  birthDate: BirthDate;
  heightCm: number;
  weightKg: number;
  workouts: Workouts | null;
  goal: Goal | null;
  diet: Diet | null;
  onboardingCompleted: boolean;
  plan: NutritionPlan | null;
  autoTrackOrders: boolean;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  description: string;
  photo: string | null; // data url
  createdAt: string; // ISO
}

export interface MealsState {
  items: Meal[];
}

export interface FoodAnalysis {
  isFood: boolean;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  description: string;
}
