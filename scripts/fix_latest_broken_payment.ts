// Fix the latest broken payment immediately
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function fixLatestBrokenPayment() {
  console.log("=".repeat(80))
  console.log("FIXING LATEST BROKEN PAYMENT")
  console.log("=".repeat(80))
  console.log()

  try {
    const paymentId = '8b69ec68-6656-4e95-baca-31b774e92c63'

    console.log("Fixing payment: BOA-1415161514783")
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
    console.log(`  Available Balance: ${availableBalance.toFixed(2)} ETB ⭐`)
    console.log()

    console.log("=".repeat(80))
    console.log("✅ PAYMENT FIXED")
    console.log("=".repeat(80))

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

fixLatestBrokenPayment()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
