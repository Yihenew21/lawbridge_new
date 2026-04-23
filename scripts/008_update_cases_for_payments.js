import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Adding payment-related columns to cases table...');

  await sql`
    ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES escrow_payments(id) ON DELETE SET NULL
  `;
  console.log('Added payment_id column.');

  await sql`
    ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5)
  `;
  console.log('Added rating column.');

  await sql`
    ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS rating_comment TEXT
  `;
  console.log('Added rating_comment column.');

  await sql`
    ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ
  `;
  console.log('Added rated_at column.');

  console.log('Creating index on cases payment_id...');
  await sql`CREATE INDEX IF NOT EXISTS idx_cases_payment_id ON cases(payment_id)`;
  console.log('Index created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
