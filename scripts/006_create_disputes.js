import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating payment_disputes table...');
  await sql`
    CREATE TABLE IF NOT EXISTS payment_disputes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payment_id UUID NOT NULL REFERENCES escrow_payments(id) ON DELETE CASCADE,
      raised_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open',
        'under_review',
        'resolved_refund',
        'resolved_release',
        'rejected'
      )),
      admin_notes TEXT,
      resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
      resolved_at TIMESTAMPTZ,
      resolution_outcome TEXT CHECK (resolution_outcome IN (
        'full_refund',
        'partial_refund',
        'no_refund',
        'release_to_lawyer'
      )),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Payment disputes table created.');

  console.log('Creating indexes on payment_disputes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_payment_disputes_payment_id ON payment_disputes(payment_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payment_disputes_raised_by ON payment_disputes(raised_by)`;
  console.log('Payment disputes indexes created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
