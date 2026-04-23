import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating platform_settings table...');

  await sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('Platform settings table created.');

  console.log('Inserting default settings...');
  await sql`
    INSERT INTO platform_settings (key, value, updated_at)
    VALUES
      ('platform_name', 'LawBridge', NOW()),
      ('support_email', 'support@lawbridge.com', NOW()),
      ('commission_rate', '15', NOW())
    ON CONFLICT (key) DO NOTHING
  `;
  console.log('Default settings inserted.');

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
