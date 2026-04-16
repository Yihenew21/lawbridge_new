import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seedBankAccounts() {
  console.log('Seeding organization bank accounts...\n');

  try {
    // Check if accounts already exist
    const existing = await sql`SELECT COUNT(*) as count FROM organization_bank_accounts`;

    if (existing[0].count > 0) {
      console.log(`Found ${existing[0].count} existing bank account(s).`);
      console.log('Skipping seed to avoid duplicates.\n');
      return;
    }

    // Insert CBE account
    console.log('Adding Commercial Bank of Ethiopia account...');
    await sql`
      INSERT INTO organization_bank_accounts (
        bank_name,
        account_number,
        account_holder_name,
        branch_name,
        is_active
      ) VALUES (
        'Commercial Bank of Ethiopia',
        '1000683541706',
        'LawBridge Ethiopia',
        'Main Branch',
        true
      )
    `;
    console.log('✓ CBE account added');

    // Insert Bank of Abyssinia account
    console.log('Adding Bank of Abyssinia account...');
    await sql`
      INSERT INTO organization_bank_accounts (
        bank_name,
        account_number,
        account_holder_name,
        branch_name,
        is_active
      ) VALUES (
        'Bank of Abyssinia',
        '106974764',
        'LawBridge Ethiopia',
        'Main Branch',
        true
      )
    `;
    console.log('✓ Bank of Abyssinia account added');

    // Insert Telebirr account
    console.log('Adding Telebirr mobile money account...');
    await sql`
      INSERT INTO organization_bank_accounts (
        bank_name,
        account_number,
        account_holder_name,
        is_active
      ) VALUES (
        'Telebirr',
        '+251976818543',
        'LawBridge Ethiopia',
        true
      )
    `;
    console.log('✓ Telebirr account added');

    console.log('\n🎉 Successfully seeded 3 bank accounts!');

    // Display the accounts
    const accounts = await sql`
      SELECT bank_name, account_number, account_holder_name, is_active
      FROM organization_bank_accounts
      ORDER BY created_at
    `;

    console.log('\nBank accounts in database:');
    accounts.forEach((acc, i) => {
      console.log(`${i + 1}. ${acc.bank_name} - ${acc.account_number} (${acc.account_holder_name})`);
    });

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedBankAccounts();
