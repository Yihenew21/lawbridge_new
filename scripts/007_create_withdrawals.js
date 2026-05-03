import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating lawyer_withdrawals table...');
  await sql`
    CREATE TABLE IF NOT EXISTS lawyer_withdrawals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'processing',
        'completed',
        'failed'
      )),
      withdrawal_method TEXT CHECK (withdrawal_method IN (
        'bank_transfer',
        'mobile_money'
      )),
      account_details JSONB,
      processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      processed_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Lawyer withdrawals table created.');

  console.log('Creating indexes on lawyer_withdrawals...');
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_withdrawals_lawyer_id ON lawyer_withdrawals(lawyer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_withdrawals_status ON lawyer_withdrawals(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_withdrawals_created_at ON lawyer_withdrawals(created_at)`;
  console.log('Lawyer withdrawals indexes created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
