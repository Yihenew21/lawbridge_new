import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function fixExistingPayments() {
  console.log('Finding payments without associated cases...');

  // Find all payments that don't have a case linked to them
  const paymentsWithoutCases = await sql`
    SELECT ep.id, ep.client_id, ep.lawyer_id, ep.case_description, ep.lawyer_name
    FROM escrow_payments ep
    LEFT JOIN cases c ON c.payment_id = ep.id
    WHERE c.id IS NULL
  `;

  console.log(`Found ${paymentsWithoutCases.length} payments without cases.`);

  if (paymentsWithoutCases.length === 0) {
    console.log('No payments need fixing. All done!');
    return;
  }

  // Create cases for each payment
  for (const payment of paymentsWithoutCases) {
    console.log(`Creating case for payment ${payment.id}...`);

    await sql`
      INSERT INTO cases (
        client_id,
        payment_id,
        title,
        description,
        category,
        status
      ) VALUES (
        ${payment.client_id},
        ${payment.id},
        'Payment Case - ' || ${payment.lawyer_name},
        ${payment.case_description},
        'general',
        'pending'
      )
    `;

    console.log(`✓ Case created for payment ${payment.id}`);
  }

  console.log(`\n✅ Successfully created ${paymentsWithoutCases.length} cases for existing payments.`);
}

fixExistingPayments().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
