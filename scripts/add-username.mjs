import pg from 'pg';

const CONNECTION = process.env.POSTGRES_URL_NON_POOLING;
if (!CONNECTION) {
  console.error('Set POSTGRES_URL_NON_POOLING env var first.');
  process.exit(1);
}

const c = new pg.Client({
  connectionString: CONNECTION.replace(/[?&]sslmode=require/, ''),
  ssl: { rejectUnauthorized: false },
});
await c.connect();

await c.query(`alter table public.profiles add column if not exists username text`);

// backfill from auth metadata / synthetic email prefix
await c.query(`
  update public.profiles p
  set username = coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1))
  from auth.users u
  where u.id = p.id and p.username is null
`);

const rows = await c.query('select id, username from public.profiles');
console.log(JSON.stringify(rows.rows, null, 1));
await c.end();
