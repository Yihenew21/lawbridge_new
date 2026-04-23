// Fix partial refund payment statuses
// Payments with partial_refund resolution should have status 'released', not 'refunded'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function fixPartialRefundStatuses() {
  console.log("=".repeat(80))
  console.log("Fixing Partial Refund Payment Statuses")
  console.log("=".repeat(80))
  console.log()

  try {
    // Find all payments with partial_refund that have wrong status
    const wrongStatusPayments = await sql`
      SELECT
        ep.id,
        ep.transaction_id,
        ep.amount,
        ep.lawyer_amount,
        ep.status,
        pd.resolution_outcome,
        pd.refund_amount
      FROM escrow_payments ep
      JOIN payment_disputes pd ON pd.payment_id = ep.id
      WHERE pd.resolution_outcome = 'partial_refund'
        AND ep.status = 'refunded'
    `

    console.log(`Found ${wrongStatusPayments.length} payments with incorrect status`)
    console.log()

    if (wrongStatusPayments.length === 0) {
      console.log("✅ No payments need fixing")
      return
    }

    console.log("Payments to fix:")
    wrongStatusPayments.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.transaction_id}`)
      console.log(`     Current Status: ${p.status} ❌`)
      console.log(`     Should Be: released ✅`)
      console.log(`     Lawyer Amount: ${parseFloat(p.lawyer_amount).toFixed(2)} ETB`)
      console.log()
    })

    console.log("Updating payment statuses...")
    console.log()

    // Update all at once
    await sql`
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
          AND ep.status = 'refunded'
      )
    `

    console.log(`✅ Updated ${wrongStatusPayments.length} payment(s) to 'released' status`)
    console.log()

    // Verify the fix for yibestlawyer@gmail.com
    const lawyer = await sql`
      SELECT id FROM users WHERE email = 'yibestlawyer@gmail.com'
    `

    if (lawyer.length > 0) {
      const lawyerId = lawyer[0].id

      const earnings = await sql`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released_earnings
        FROM escrow_payments
        WHERE lawyer_id = ${lawyerId}
      `

      const withdrawals = await sql`
        SELECT COALESCE(SUM(amount), 0) as total_withdrawn
        FROM lawyer_withdrawals
        WHERE lawyer_id = ${lawyerId} AND status = 'completed'
      `

      const availableBalance = parseFloat(earnings[0].released_earnings) - parseFloat(withdrawals[0].total_withdrawn)

      console.log("Verification for yibestlawyer@gmail.com:")
      console.log(`  Released Earnings: ${parseFloat(earnings[0].released_earnings).toFixed(2)} ETB`)
      console.log(`  Total Withdrawn: ${parseFloat(withdrawals[0].total_withdrawn).toFixed(2)} ETB`)
      console.log(`  Available Balance: ${availableBalance.toFixed(2)} ETB ⭐`)
      console.log()
    }

    console.log("=".repeat(80))
    console.log("✅ FIX COMPLETE")
    console.log("=".repeat(80))

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

fixPartialRefundStatuses()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
