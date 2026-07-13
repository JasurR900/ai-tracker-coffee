import type { BirthDate, Diet, Gender, Goal, NutritionPlan, Workouts } from '@/types';

const ACTIVITY_FACTORS: Record<Workouts, number> = {
  '0-2': 1.375,
  '3-5': 1.55,
  '6+': 1.725,
};

const GOAL_FACTORS: Record<Goal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.15,
};

/** Macro split (protein / fats / carbs) by diet, in fractions of calories. */
const DIET_SPLITS: Record<Diet, { protein: number; fats: number; carbs: number }> = {
  classic: { protein: 0.3, fats: 0.25, carbs: 0.45 },
  vegan: { protein: 0.2, fats: 0.25, carbs: 0.55 },
  keto: { protein: 0.25, fats: 0.7, carbs: 0.05 },
  paleo: { protein: 0.35, fats: 0.4, carbs: 0.25 },
};

export function getAge(birthDate: BirthDate, now = new Date()): number {
  let age = now.getFullYear() - birthDate.year;
  const beforeBirthday =
    now.getMonth() < birthDate.month ||
    (now.getMonth() === birthDate.month && now.getDate() < birthDate.day);
  if (beforeBirthday) age -= 1;
  return Math.max(1, age);
}

export interface PlanInput {
  gender: Gender;
  birthDate: BirthDate;
  heightCm: number;
  weightKg: number;
  workouts: Workouts;
  goal: Goal;
  diet: Diet;
}

/** Mifflin–St Jeor BMR × activity × goal, macros split by diet. */
export function calculatePlan(input: PlanInput): NutritionPlan {
  const age = getAge(input.birthDate);
  const bmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * age +
    (input.gender === 'male' ? 5 : -161);

  const calories = Math.round(
    bmr * ACTIVITY_FACTORS[input.workouts] * GOAL_FACTORS[input.goal],
  );

  const split = DIET_SPLITS[input.diet];
  return {
    calories,
    protein: Math.round((calories * split.protein) / 4),
    carbs: Math.round((calories * split.carbs) / 4),
    fats: Math.round((calories * split.fats) / 9),
  };
}
