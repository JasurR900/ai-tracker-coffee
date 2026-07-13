import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { USERNAME_RE, usernameToEmail } from '@/lib/username';

export const runtime = 'nodejs';

/**
 * Creates a user from a username + password. Supabase password-auth needs an
 * email, so the username is mapped to a synthetic internal address; the user
 * is created pre-confirmed via the service-role admin API.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  let username: string;
  let password: string;
  try {
    const body = await request.json();
    username = String(body.username ?? '').trim().toLowerCase();
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: 'Имя пользователя: 3–20 символов, только латинские буквы, цифры и _' },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Пароль должен быть не короче 6 символов' }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    const exists = /already|registered|exists/i.test(error.message);
    return NextResponse.json(
      { error: exists ? 'Это имя пользователя уже занято' : error.message },
      { status: exists ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
