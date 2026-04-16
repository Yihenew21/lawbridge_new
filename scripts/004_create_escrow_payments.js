import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating escrow_payments table...');
  await sql`
    CREATE TABLE IF NOT EXISTS escrow_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
      bank_account_id UUID NOT NULL REFERENCES organization_bank_accounts(id) ON DELETE RESTRICT,
      transaction_id TEXT UNIQUE NOT NULL,
      amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
      commission_rate NUMERIC(5, 2) DEFAULT 15.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
      commission_amount NUMERIC(10, 2),
      lawyer_amount NUMERIC(10, 2),
      status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN (
        'pending_verification',
        'verified',
        'held_in_escrow',
        'released',
        'refunded',
        'disputed',
        'rejected'
      )),
      case_description TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      lawyer_name TEXT NOT NULL,
      lawyer_email TEXT NOT NULL,
      verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
      verified_at TIMESTAMPTZ,
      released_at TIMESTAMPTZ,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Escrow payments table created.');

  console.log('Creating indexes on escrow_payments...');
  await sql`CREATE INDEX IF NOT EXISTS idx_escrow_payments_client_id ON escrow_payments(client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrow_payments_lawyer_id ON escrow_payments(lawyer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrow_payments_case_id ON escrow_payments(case_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrow_payments_status ON escrow_payments(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrow_payments_transaction_id ON escrow_payments(transaction_id)`;
  console.log('Escrow payments indexes created.');

  console.log('Creating trigger function to calculate commission...');
  await sql`
    CREATE OR REPLACE FUNCTION calculate_payment_commission()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.commission_amount := ROUND((NEW.amount * NEW.commission_rate / 100), 2);
      NEW.lawyer_amount := NEW.amount - NEW.commission_amount;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;
  console.log('Trigger function created.');

  console.log('Creating trigger on escrow_payments...');
  await sql`
    DROP TRIGGER IF EXISTS trigger_calculate_commission ON escrow_payments;
  `;
  await sql`
    CREATE TRIGGER trigger_calculate_commission
    BEFORE INSERT OR UPDATE OF amount, commission_rate ON escrow_payments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_payment_commission();
  `;
  console.log('Trigger created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
