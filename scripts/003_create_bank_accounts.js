import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating organization_bank_accounts table...');
  await sql`
    CREATE TABLE IF NOT EXISTS organization_bank_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL UNIQUE,
      account_holder_name TEXT NOT NULL,
      branch_name TEXT,
      swift_code TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Organization bank accounts table created.');

  console.log('Creating indexes on organization_bank_accounts...');
  await sql`CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON organization_bank_accounts(is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number ON organization_bank_accounts(account_number)`;
  console.log('Organization bank accounts indexes created.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
