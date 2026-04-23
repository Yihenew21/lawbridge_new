// Fix ALL partial refunds with wrong status (comprehensive fix)
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function fixAllPartialRefunds() {
  console.log("=".repeat(80))
  console.log("Comprehensive Fix: All Partial Refunds")
  console.log("=".repeat(80))
  console.log()

  try {
    // Find ALL partial refunds with wrong status (not 'released')
    const wrongStatusPayments = await sql`
      SELECT
        ep.id,
        ep.transaction_id,
        ep.amount,
        ep.lawyer_amount,
        ep.status,
        pd.resolution_outcome,
        pd.refund_amount,
        u.email as lawyer_email
      FROM escrow_payments ep
      JOIN payment_disputes pd ON pd.payment_id = ep.id
      JOIN users u ON u.id = ep.lawyer_id
      WHERE pd.resolution_outcome = 'partial_refund'
        AND ep.status != 'released'
    `

    console.log(`Found ${wrongStatusPayments.length} partial refund(s) with wrong status`)
    console.log()

    if (wrongStatusPayments.length === 0) {
      console.log("✅ All partial refunds have correct status!")
      return
    }

    console.log("Payments to fix:")
    wrongStatusPayments.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.transaction_id} (${p.lawyer_email})`)
      console.log(`     Current Status: ${p.status} ❌`)
      console.log(`     Lawyer Amount: ${parseFloat(p.lawyer_amount).toFixed(2)} ETB`)
      console.log()
    })

    console.log("Fixing all payments...")
    console.log()

    // Fix all at once
    const result = await sql`
      UPDATE escrow_payments
      SET
        status = 'released',
        released_at = NOW(),
        updated_at = NOW()
      WHERE id IN (
        SELECT ep.id
        FROM escrow_payments ep
        JOIN payment_disputes pd ON pd.payment_id = ep.id
        WHERE pd.resolution_outcome = 'partial_refund'
          AND ep.status != 'released'
      )
    `

    console.log(`✅ Fixed ${wrongStatusPayments.length} payment(s)`)
    console.log()

    // Verify balances for affected lawyers
    const affectedLawyers = [...new Set(wrongStatusPayments.map(p => p.lawyer_email))]

    console.log("Updated Balances:")
    console.log("-".repeat(80))

    for (const email of affectedLawyers) {
      const lawyer = await sql`
        SELECT id FROM users WHERE email = ${email}
      `

      if (lawyer.length === 0) continue

      const earnings = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released_earnings
        FROM escrow_payments
        WHERE lawyer_id = ${lawyer[0].id}
      `

      const withdrawals = await sql`
        SELECT COALESCE(SUM(amount), 0) as total_withdrawn
        FROM lawyer_withdrawals
        WHERE lawyer_id = ${lawyer[0].id} AND status = 'completed'
      `

      const availableBalance = parseFloat(earnings[0].released_earnings) - parseFloat(withdrawals[0].total_withdrawn)

      console.log(`${email}:`)
      console.log(`  Released Earnings: ${parseFloat(earnings[0].released_earnings).toFixed(2)} ETB`)
      console.log(`  Available Balance: ${availableBalance.toFixed(2)} ETB ⭐`)
      console.log()
    }

    console.log("=".repeat(80))
    console.log("✅ COMPREHENSIVE FIX COMPLETE")
    console.log("=".repeat(80))

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

fixAllPartialRefunds()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
