// Investigate why partial refund got wrong status
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_ksUCF3exB8WX@ep-bitter-paper-aiz5wyic-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function investigateDisputeResolution() {
  console.log("=".repeat(80))
  console.log("Investigating Dispute Resolution")
  console.log("=".repeat(80))
  console.log()

  try {
    const paymentId = 'a8c506c6-9146-4279-a675-858a489fd295'

    // Get the dispute details
    const dispute = await sql`
      SELECT
        pd.id,
        pd.resolution_outcome,
        pd.refund_amount,
        pd.admin_notes,
        pd.resolved_at,
        pd.status as dispute_status
      FROM payment_disputes pd
      WHERE pd.payment_id = ${paymentId}
    `

    if (dispute.length === 0) {
      console.log("❌ No dispute found for this payment")
      return
    }

    console.log("Dispute Details:")
    console.log(`  Dispute ID: ${dispute[0].id}`)
    console.log(`  Resolution Outcome: ${dispute[0].resolution_outcome}`)
    console.log(`  Refund Amount: ${parseFloat(dispute[0].refund_amount || 0).toFixed(2)} ETB`)
    console.log(`  Dispute Status: ${dispute[0].dispute_status}`)
    console.log(`  Admin Notes: ${dispute[0].admin_notes || 'None'}`)
    console.log(`  Resolved At: ${dispute[0].resolved_at}`)
    console.log()

    // Check payment status history
    const history = await sql`
      SELECT
        old_status,
        new_status,
        notes,
        created_at,
        changed_by
      FROM payment_status_history
      WHERE payment_id = ${paymentId}
      ORDER BY created_at DESC
    `

    console.log("Payment Status History:")
    history.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.old_status} → ${h.new_status}`)
      console.log(`     At: ${h.created_at}`)
      console.log(`     Notes: ${h.notes}`)
      console.log(`     Changed By: ${h.changed_by}`)
      console.log()
    })

    // Analysis
    console.log("=".repeat(80))
    console.log("ANALYSIS:")
    console.log("=".repeat(80))

    if (dispute[0].resolution_outcome === 'partial_refund') {
      console.log("✓ Dispute resolution_outcome is 'partial_refund' (correct)")
      console.log("✗ But payment status was 'refunded' (wrong)")
      console.log()
      console.log("CONCLUSION:")
      console.log("The code at line 118 sets newPaymentStatus = 'released' for partial_refund,")
      console.log("but somehow the payment got status 'refunded' instead.")
      console.log()
      console.log("Possible causes:")
      console.log("1. The dispute was initially resolved as 'full_refund' then changed")
      console.log("2. There's a bug in the dispute resolution endpoint")
      console.log("3. The status was manually changed in the database")
      console.log("4. There's a race condition or transaction issue")
    } else {
      console.log(`✗ Dispute resolution_outcome is '${dispute[0].resolution_outcome}' (not partial_refund)`)
      console.log("This explains why the status was 'refunded'")
    }

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

investigateDisputeResolution()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
