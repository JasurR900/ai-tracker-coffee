import type { ProfileState } from '@/types';

/** True when the user has started onboarding in the current session. */
export function hasLocalOnboardingProgress(profile: ProfileState): boolean {
  return (
    profile.gender !== null ||
    profile.workouts !== null ||
    profile.goal !== null ||
    profile.diet !== null
  );
}

/** Prefer in-session onboarding progress over an incomplete server snapshot. */
export function mergeProfileFromServer(
  local: ProfileState,
  server: ProfileState,
): ProfileState {
  if (server.onboardingCompleted && server.plan) return server;
  if (!hasLocalOnboardingProgress(local) || local.onboardingCompleted) return server;

  return {
    ...server,
    gender: local.gender ?? server.gender,
    birthDate: local.birthDate ?? server.birthDate,
    heightCm: local.heightCm ?? server.heightCm,
    weightKg: local.weightKg ?? server.weightKg,
    workouts: local.workouts ?? server.workouts,
    goal: local.goal ?? server.goal,
    diet: local.diet ?? server.diet,
    plan: local.plan ?? server.plan,
    onboardingCompleted: local.onboardingCompleted || server.onboardingCompleted,
    autoTrackOrders: local.autoTrackOrders || server.autoTrackOrders,
  };
}
