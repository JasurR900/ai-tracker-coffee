/**
 * Supabase password-auth requires an email, so usernames are mapped to a
 * synthetic internal address the user never sees.
 */
export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

const DOMAIN = 'users.calai.app';

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${DOMAIN}`;
}

export function emailToUsername(email: string | null): string | null {
  if (!email) return null;
  return email.split('@')[0];
}
