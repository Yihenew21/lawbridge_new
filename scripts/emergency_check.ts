// Emergency investigation - check latest dispute
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function emergencyCheck() {
  console.log("=".repeat(80))
  console.log("EMERGENCY CHECK - Latest Dispute")
  console.log("=".repeat(80))
  console.log()

  try {
    // Get the absolute latest dispute
    const latestDispute = await sql`
      SELECT
        pd.id as dispute_id,
        pd.resolution_outcome,
        pd.refund_amount,
        pd.status as dispute_status,
        pd.resolved_at,
        pd.admin_notes,
        ep.id as payment_id,
        ep.transaction_id,
        ep.amount,
        ep.lawyer_amount,
        ep.commission_amount,
        ep.status as payment_status,
        ep.released_at,
        u.email as lawyer_email,
        c.email as client_email
      FROM payment_disputes pd
      JOIN escrow_payments ep ON ep.id = pd.payment_id
      JOIN users u ON u.id = ep.lawyer_id
      JOIN users c ON c.id = ep.client_id
      ORDER BY pd.resolved_at DESC NULLS LAST, pd.created_at DESC
      LIMIT 1
    `

    if (latestDispute.length === 0) {
      console.log("No disputes found")
      return
    }

    const d = latestDispute[0]

    console.log("LATEST DISPUTE:")
    console.log("-".repeat(80))
    console.log(`Dispute ID: ${d.dispute_id}`)
    console.log(`Payment ID: ${d.payment_id}`)
    console.log(`Transaction: ${d.transaction_id}`)
    console.log(`Lawyer: ${d.lawyer_email}`)
    console.log(`Client: ${d.client_email}`)
    console.log()
    console.log(`Original Amount: ${parseFloat(d.amount).toFixed(2)} ETB`)
    console.log(`Refund Amount: ${parseFloat(d.refund_amount || 0).toFixed(2)} ETB`)
    console.log(`Lawyer Amount: ${parseFloat(d.lawyer_amount).toFixed(2)} ETB`)
    console.log(`Commission: ${parseFloat(d.commission_amount).toFixed(2)} ETB`)
    console.log()
    console.log(`Resolution Outcome: ${d.resolution_outcome}`)
    console.log(`Dispute Status: ${d.dispute_status}`)
    console.log(`Payment Status: ${d.payment_status} ${d.payment_status === 'released' ? '✓' : '❌'}`)
    console.log(`Released At: ${d.released_at || 'NOT SET'}`)
    console.log(`Resolved At: ${d.resolved_at || 'NOT RESOLVED'}`)
    console.log()

    // Check what the client would see
    console.log("CLIENT VIEW LOGIC:")
    console.log("-".repeat(80))
    if (d.payment_status === 'released' && d.resolution_outcome === 'partial_refund') {
      console.log("Display Status: 'partial_refund' (Purple badge)")
    } else if (d.payment_status === 'refunded' && d.resolution_outcome === 'full_refund') {
      console.log("Display Status: 'refunded' (Full Refund - Indigo badge)")
    } else if (d.payment_status === 'refunded') {
      console.log("Display Status: 'refunded' (Full Refund - Indigo badge) ⚠️ WRONG!")
    } else {
      console.log(`Display Status: '${d.payment_status}'`)
    }
    console.log()

    // Check lawyer's current balance
    const lawyer = await sql`
      SELECT id FROM users WHERE email = ${d.lawyer_email}
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

    console.log("LAWYER BALANCE:")
    console.log("-".repeat(80))
    console.log(`Released Earnings: ${parseFloat(earnings[0].released_earnings).toFixed(2)} ETB`)
    console.log(`Available Balance: ${availableBalance.toFixed(2)} ETB`)
    console.log()

    // Analysis
    console.log("ANALYSIS:")
    console.log("-".repeat(80))
    if (d.resolution_outcome === 'partial_refund' && d.payment_status !== 'released') {
      console.log("❌ BUG CONFIRMED: Partial refund has wrong payment status!")
      console.log(`   Expected: 'released'`)
      console.log(`   Actual: '${d.payment_status}'`)
      console.log()
      console.log("This means:")
      console.log("- Lawyer's balance NOT updated (payment not counted)")
      console.log("- Client sees 'Full Refund' instead of 'Partial Refund'")
    } else if (d.resolution_outcome === 'partial_refund' && d.payment_status === 'released') {
      console.log("✓ Payment status is correct ('released')")
      console.log("✓ Lawyer's balance should include this payment")
    }

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

emergencyCheck()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
