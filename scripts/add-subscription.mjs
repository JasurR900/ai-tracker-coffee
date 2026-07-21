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
await c.query('alter table public.profiles add column if not exists subscription jsonb');
console.log('subscription column ready');
await c.end();
