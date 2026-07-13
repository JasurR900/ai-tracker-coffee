import type { MealsState, ProfileState } from '@/types';

const PROFILE_KEY = 'calai:profile';
const MEALS_KEY = 'calai:meals';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadProfile(): ProfileState | null {
  if (typeof window === 'undefined') return null;
  return safeParse<ProfileState>(window.localStorage.getItem(PROFILE_KEY));
}

export function loadMeals(): MealsState | null {
  if (typeof window === 'undefined') return null;
  return safeParse<MealsState>(window.localStorage.getItem(MEALS_KEY));
}

export function saveProfile(profile: ProfileState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // quota exceeded — ignore
  }
}

export function saveMeals(meals: MealsState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch {
    // quota exceeded — drop oldest photos and retry once
    try {
      const trimmed: MealsState = {
        items: meals.items.slice(0, 10).map((m, i) => (i > 4 ? { ...m, photo: null } : m)),
      };
      window.localStorage.setItem(MEALS_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }
}
