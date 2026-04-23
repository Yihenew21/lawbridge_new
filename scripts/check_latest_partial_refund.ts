// Check latest partial refund in database
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function checkLatestPartialRefund() {
  console.log("=".repeat(80))
  console.log("Checking Latest Partial Refund")
  console.log("=".repeat(80))
  console.log()

  try {
    // Get latest partial refund dispute
    const latestDispute = await sql`
      SELECT
        pd.id as dispute_id,
        pd.resolution_outcome,
        pd.refund_amount,
        pd.resolved_at,
        ep.id as payment_id,
        ep.transaction_id,
        ep.amount,
        ep.lawyer_amount,
        ep.status,
        ep.released_at,
        u.email as lawyer_email
      FROM payment_disputes pd
      JOIN escrow_payments ep ON ep.id = pd.payment_id
      JOIN users u ON u.id = ep.lawyer_id
      WHERE pd.resolution_outcome = 'partial_refund'
      ORDER BY pd.resolved_at DESC
      LIMIT 5
    `

    console.log(`Found ${latestDispute.length} recent partial refunds:`)
    console.log()

    latestDispute.forEach((d, i) => {
      console.log(`${i + 1}. Dispute resolved at: ${d.resolved_at}`)
      console.log(`   Payment ID: ${d.payment_id}`)
      console.log(`   Transaction: ${d.transaction_id}`)
      console.log(`   Lawyer: ${d.lawyer_email}`)
      console.log(`   Original Amount: ${parseFloat(d.amount).toFixed(2)} ETB`)
      console.log(`   Refund Amount: ${parseFloat(d.refund_amount).toFixed(2)} ETB`)
      console.log(`   Lawyer Amount: ${parseFloat(d.lawyer_amount).toFixed(2)} ETB`)
      console.log(`   Payment Status: ${d.status} ${d.status === 'released' ? '✓' : '❌'}`)
      console.log(`   Released At: ${d.released_at || 'NOT SET'}`)
      console.log()
    })

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

checkLatestPartialRefund()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
