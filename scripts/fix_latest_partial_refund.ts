// Fix the latest partial refund payment
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function fixLatestPartialRefund() {
  console.log("=".repeat(80))
  console.log("Fixing Latest Partial Refund Payment")
  console.log("=".repeat(80))
  console.log()

  try {
    const paymentId = 'a8c506c6-9146-4279-a675-858a489fd295'

    // Check current status
    const before = await sql`
      SELECT id, transaction_id, status, lawyer_amount, released_at
      FROM escrow_payments
      WHERE id = ${paymentId}
    `

    console.log("BEFORE:")
    console.log(`  Transaction: ${before[0].transaction_id}`)
    console.log(`  Status: ${before[0].status}`)
    console.log(`  Lawyer Amount: ${parseFloat(before[0].lawyer_amount).toFixed(2)} ETB`)
    console.log(`  Released At: ${before[0].released_at || 'NOT SET'}`)
    console.log()

    // Fix the status
    await sql`
      UPDATE escrow_payments
      SET
        status = 'released',
        released_at = NOW(),
        updated_at = NOW()
      WHERE id = ${paymentId}
    `

    console.log("✅ Updated payment status to 'released'")
    console.log()

    // Check after
    const after = await sql`
      SELECT id, transaction_id, status, lawyer_amount, released_at
      FROM escrow_payments
      WHERE id = ${paymentId}
    `

    console.log("AFTER:")
    console.log(`  Transaction: ${after[0].transaction_id}`)
    console.log(`  Status: ${after[0].status}`)
    console.log(`  Lawyer Amount: ${parseFloat(after[0].lawyer_amount).toFixed(2)} ETB`)
    console.log(`  Released At: ${after[0].released_at}`)
    console.log()

    // Check lawyer's new balance
    const lawyer = await sql`
      SELECT id FROM users WHERE email = 'yibestlawyer@gmail.com'
    `

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

    console.log("Updated Balance for yibestlawyer@gmail.com:")
    console.log(`  Released Earnings: ${parseFloat(earnings[0].released_earnings).toFixed(2)} ETB`)
    console.log(`  Total Withdrawn: ${parseFloat(withdrawals[0].total_withdrawn).toFixed(2)} ETB`)
    console.log(`  Available Balance: ${availableBalance.toFixed(2)} ETB ⭐`)
    console.log()

    console.log("=".repeat(80))
    console.log("✅ FIX COMPLETE")
    console.log("=".repeat(80))

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

fixLatestPartialRefund()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
