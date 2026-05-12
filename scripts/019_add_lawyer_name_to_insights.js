import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Adding lawyer_name column to insights table...');

  // Add lawyer_name column
  await sql`
    ALTER TABLE insights
    ADD COLUMN IF NOT EXISTS lawyer_name TEXT
  `;
  console.log('Added lawyer_name column.');

  // Populate lawyer_name for existing records
  console.log('Populating lawyer_name for existing records...');
  await sql`
    UPDATE insights
    SET lawyer_name = CONCAT(u.first_name, ' ', u.last_name)
    FROM users u
    WHERE insights.lawyer_id = u.id
    AND insights.lawyer_name IS NULL
  `;
  console.log('Populated lawyer_name for existing records.');

  // Make lawyer_name NOT NULL after populating
  await sql`
    ALTER TABLE insights
    ALTER COLUMN lawyer_name SET NOT NULL
  `;
  console.log('Set lawyer_name as NOT NULL.');

  console.log('Insights table update complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
