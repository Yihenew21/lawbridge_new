import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('Starting payment system migrations...\n');

  try {
    // Migration 003: Bank Accounts
    console.log('Running 003_create_bank_accounts...');
    await import('./003_create_bank_accounts.js');
    console.log('✓ 003 completed\n');

    // Migration 004: Escrow Payments
    console.log('Running 004_create_escrow_payments...');
    await import('./004_create_escrow_payments.js');
    console.log('✓ 004 completed\n');

    // Migration 005: Payment History
    console.log('Running 005_create_payment_history...');
    await import('./005_create_payment_history.js');
    console.log('✓ 005 completed\n');

    // Migration 006: Disputes
    console.log('Running 006_create_disputes...');
    await import('./006_create_disputes.js');
    console.log('✓ 006 completed\n');

    // Migration 007: Withdrawals
    console.log('Running 007_create_withdrawals...');
    await import('./007_create_withdrawals.js');
    console.log('✓ 007 completed\n');

    // Migration 008: Update Cases
    console.log('Running 008_update_cases_for_payments...');
    await import('./008_update_cases_for_payments.js');
    console.log('✓ 008 completed\n');

    console.log('All payment system migrations completed successfully! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
