import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Updating users table with additional columns...');

  // Add avatar and location fields
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`;
  console.log('Added avatar_url and address columns.');

  // Add email verification fields
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;
  console.log('Added email verification columns.');

  // Add 2FA fields
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB`;
  console.log('Added 2FA columns.');

  // Add account security fields
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT`;
  console.log('Added security columns.');

  // Add profile completion fields
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE`;
  console.log('Added profile tracking columns.');

  // Add constraint for account_status if it doesn't exist
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_account_status_check'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_account_status_check
        CHECK (account_status IN ('active', 'suspended', 'deactivated', 'pending_verification'));
      END IF;
    END $$;
  `;
  console.log('Added account_status constraint.');

  // Create indexes for new columns
  console.log('Creating indexes on new columns...');
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled)`;
  console.log('Indexes created.');

  console.log('Users table update complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
