import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Fixing users table: replacing full_name with first_name + last_name...');

  // Add first_name and last_name columns
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`;

  // Migrate existing data (split full_name into first/last) only if full_name exists
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'full_name'
      ) THEN
        UPDATE users
        SET first_name = split_part(full_name, ' ', 1),
            last_name = CASE
              WHEN position(' ' in full_name) > 0
              THEN substring(full_name from position(' ' in full_name) + 1)
              ELSE ''
            END
        WHERE full_name IS NOT NULL AND (first_name IS NULL OR last_name IS NULL);

        ALTER TABLE users DROP COLUMN IF EXISTS full_name;
      END IF;
    END $$;
  `;

  console.log('Users table fixed.');

  console.log('Fixing sessions table: renaming token_hash to token...');
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sessions' AND column_name = 'token_hash'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sessions' AND column_name = 'token'
      ) THEN
        ALTER TABLE sessions RENAME COLUMN token_hash TO token;
      END IF;
    END $$;
  `;
  console.log('Sessions table fixed.');

  console.log('Schema fix migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
