import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating payment_status_history table...');
  await sql`
    CREATE TABLE IF NOT EXISTS payment_status_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payment_id UUID NOT NULL REFERENCES escrow_payments(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Payment status history table created.');

  console.log('Creating indexes on payment_status_history...');
  await sql`CREATE INDEX IF NOT EXISTS idx_payment_history_payment_id ON payment_status_history(payment_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_status_history(created_at)`;
  console.log('Payment status history indexes created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
