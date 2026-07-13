/**
 * One-time Supabase schema setup: profiles + meals tables, RLS policies,
 * meal-photos storage bucket.
 * Run: POSTGRES_URL_NON_POOLING="postgres://..." node scripts/setup-db.mjs
 */
import pg from 'pg';

const CONNECTION = process.env.POSTGRES_URL_NON_POOLING;
if (!CONNECTION) {
  console.error('Set POSTGRES_URL_NON_POOLING env var first.');
  process.exit(1);
}

const SQL = `
-- ===== profiles =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  gender text,
  birth_date jsonb,
  height_cm integer default 170,
  weight_kg numeric default 70,
  workouts text,
  goal text,
  diet text,
  plan jsonb,
  auto_track_orders boolean default false,
  onboarding_completed boolean default false,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- ===== meals =====
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories integer not null default 0,
  protein numeric not null default 0,
  fats numeric not null default 0,
  carbs numeric not null default 0,
  description text default '',
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_created_idx on public.meals (user_id, created_at desc);

alter table public.meals enable row level security;

drop policy if exists "meals_select_own" on public.meals;
create policy "meals_select_own" on public.meals for select using (auth.uid() = user_id);
drop policy if exists "meals_insert_own" on public.meals;
create policy "meals_insert_own" on public.meals for insert with check (auth.uid() = user_id);
drop policy if exists "meals_update_own" on public.meals;
create policy "meals_update_own" on public.meals for update using (auth.uid() = user_id);
drop policy if exists "meals_delete_own" on public.meals;
create policy "meals_delete_own" on public.meals for delete using (auth.uid() = user_id);

-- ===== storage bucket for meal photos =====
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "meal_photos_insert_own" on storage.objects;
create policy "meal_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "meal_photos_update_own" on storage.objects;
create policy "meal_photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "meal_photos_delete_own" on storage.objects;
create policy "meal_photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "meal_photos_public_read" on storage.objects;
create policy "meal_photos_public_read" on storage.objects
  for select using (bucket_id = 'meal-photos');
`;

const client = new pg.Client({
  connectionString: CONNECTION.replace(/[?&]sslmode=require/, ''),
  ssl: { rejectUnauthorized: false },
});
try {
  await client.connect();
  await client.query(SQL);
  const tables = await client.query(
    "select table_name from information_schema.tables where table_schema='public' and table_name in ('profiles','meals')",
  );
  const bucket = await client.query("select id, public from storage.buckets where id='meal-photos'");
  console.log('Tables:', tables.rows.map((r) => r.table_name).join(', '));
  console.log('Bucket:', JSON.stringify(bucket.rows));
  console.log('Setup complete.');
} finally {
  await client.end();
}
