'use client';

import { getSupabase } from './client';
import { initialProfileState } from '@/store/slices/profileSlice';
import type { Meal, ProfileState } from '@/types';

/* ===== profiles ===== */

interface ProfileRow {
  id: string;
  gender: ProfileState['gender'];
  birth_date: ProfileState['birthDate'] | null;
  height_cm: number | null;
  weight_kg: number | null;
  workouts: ProfileState['workouts'];
  goal: ProfileState['goal'];
  diet: ProfileState['diet'];
  plan: ProfileState['plan'];
  auto_track_orders: boolean | null;
  onboarding_completed: boolean | null;
}

function rowToProfile(row: ProfileRow): ProfileState {
  return {
    gender: row.gender ?? null,
    birthDate: row.birth_date ?? initialProfileState.birthDate,
    heightCm: row.height_cm ?? initialProfileState.heightCm,
    weightKg: Number(row.weight_kg ?? initialProfileState.weightKg),
    workouts: row.workouts ?? null,
    goal: row.goal ?? null,
    diet: row.diet ?? null,
    plan: row.plan ?? null,
    autoTrackOrders: Boolean(row.auto_track_orders),
    onboardingCompleted: Boolean(row.onboarding_completed),
  };
}

export async function fetchProfile(userId: string): Promise<ProfileState | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

export async function upsertProfile(
  userId: string,
  profile: ProfileState,
  username?: string | null,
): Promise<void> {
  const { error } = await getSupabase().from('profiles').upsert({
    id: userId,
    username: username ?? null,
    gender: profile.gender,
    birth_date: profile.birthDate,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    workouts: profile.workouts,
    goal: profile.goal,
    diet: profile.diet,
    plan: profile.plan,
    auto_track_orders: profile.autoTrackOrders,
    onboarding_completed: profile.onboardingCompleted,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function deleteProfile(userId: string): Promise<void> {
  await getSupabase().from('profiles').delete().eq('id', userId);
}

/* ===== meals ===== */

interface MealRow {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}

function rowToMeal(row: MealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    calories: row.calories,
    protein: Number(row.protein),
    fats: Number(row.fats),
    carbs: Number(row.carbs),
    description: row.description ?? '',
    photo: row.photo_url,
    createdAt: row.created_at,
  };
}

export async function fetchMeals(userId: string): Promise<Meal[]> {
  const { data, error } = await getSupabase()
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as MealRow[]).map(rowToMeal);
}

export async function insertMeal(
  userId: string,
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> {
  const { data, error } = await getSupabase()
    .from('meals')
    .insert({
      user_id: userId,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      fats: meal.fats,
      carbs: meal.carbs,
      description: meal.description,
      photo_url: meal.photo,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return rowToMeal(data as MealRow);
}

export async function updateMealRow(
  mealId: string,
  fields: Pick<Meal, 'name' | 'calories' | 'protein' | 'fats' | 'carbs' | 'description'>,
): Promise<void> {
  const { error } = await getSupabase()
    .from('meals')
    .update({
      name: fields.name,
      calories: fields.calories,
      protein: fields.protein,
      fats: fields.fats,
      carbs: fields.carbs,
      description: fields.description,
    })
    .eq('id', mealId);
  if (error) throw new Error(error.message);
}

export async function deleteMeals(userId: string): Promise<void> {
  await getSupabase().from('meals').delete().eq('user_id', userId);
}

/* ===== storage ===== */

/** Uploads a JPEG data URL to the meal-photos bucket, returns its public URL. */
export async function uploadMealPhoto(userId: string, dataUrl: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${userId}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from('meal-photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) return null;
    return supabase.storage.from('meal-photos').getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}
