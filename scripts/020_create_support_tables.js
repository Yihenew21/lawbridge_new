import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating support tables...');

  // Contact submissions table
  await sql`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
      assigned_to UUID REFERENCES users(id),
      admin_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `;
  console.log('Created contact_submissions table.');

  // Issue reports table
  await sql`
    CREATE TABLE IF NOT EXISTS issue_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      issue_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      steps_to_reproduce TEXT,
      expected_behavior TEXT,
      actual_behavior TEXT,
      browser_info TEXT,
      attachment_urls JSONB DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'in_progress', 'resolved', 'closed', 'wont_fix')),
      assigned_to UUID REFERENCES users(id),
      admin_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `;
  console.log('Created issue_reports table.');

  // Create indexes
  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issue_reports_severity ON issue_reports(severity)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issue_reports_created_at ON issue_reports(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issue_reports_user_id ON issue_reports(user_id)`;
  console.log('Indexes created.');

  console.log('Support tables migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
