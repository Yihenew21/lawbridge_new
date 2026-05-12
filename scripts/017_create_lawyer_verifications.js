import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating lawyer_verifications table...');

  await sql`
    CREATE TABLE IF NOT EXISTS lawyer_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      license_number TEXT NOT NULL,
      license_expiry DATE NOT NULL,
      bar_association TEXT,
      document_urls JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
      verified_at TIMESTAMPTZ,
      verified_by UUID REFERENCES users(id),
      rejection_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Created lawyer_verifications table.');

  // Create indexes
  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_lawyer_id ON lawyer_verifications(lawyer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_status ON lawyer_verifications(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lawyer_verifications_created_at ON lawyer_verifications(created_at DESC)`;
  console.log('Indexes created.');

  console.log('Lawyer verifications table migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
