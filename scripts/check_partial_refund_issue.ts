import { getDb } from "../lib/db"

async function checkPartialRefundIssue() {
  const sql = getDb()

  console.log("=== Checking Recent Partial Refund Disputes ===\n")

  // Get platform commission rate
  const settingsResult = await sql`
    SELECT value FROM platform_settings WHERE key = 'commission_rate'
  `
  const platformCommissionRate = settingsResult.length > 0
    ? parseFloat(settingsResult[0].value)
    : 15.0

  console.log(`Platform Commission Rate: ${platformCommissionRate}%\n`)

  // Get recent disputes with partial refund resolution
  const disputes = await sql`
    SELECT
      pd.id as dispute_id,
      pd.status as dispute_status,
      pd.resolution_outcome,
      pd.refund_amount,
      pd.resolved_at,
      ep.id as payment_id,
      ep.transaction_id,
      ep.amount as original_amount,
      ep.lawyer_amount,
      ep.commission_amount,
      ep.status as payment_status,
      ep.lawyer_id,
      ep.client_id
    FROM payment_disputes pd
    JOIN escrow_payments ep ON ep.id = pd.payment_id
    WHERE pd.resolution_outcome = 'partial_refund'
    ORDER BY pd.resolved_at DESC
    LIMIT 5
  `

  if (disputes.length === 0) {
    console.log("No partial refund disputes found.")
    return
  }

  for (const dispute of disputes) {
    console.log(`\n--- Dispute ID: ${dispute.dispute_id} ---`)
    console.log(`Transaction ID: ${dispute.transaction_id}`)
    console.log(`Resolved At: ${dispute.resolved_at}`)
    console.log(`\nDispute Info:`)
    console.log(`  Status: ${dispute.dispute_status}`)
    console.log(`  Resolution: ${dispute.resolution_outcome}`)
    console.log(`  Refund Amount: ${dispute.refund_amount} ETB`)
    console.log(`\nPayment Info:`)
    console.log(`  Original Amount: ${dispute.original_amount} ETB`)
    console.log(`  Payment Status: ${dispute.payment_status}`)
    console.log(`  Lawyer Amount: ${dispute.lawyer_amount} ETB`)
    console.log(`  Commission: ${dispute.commission_amount} ETB`)

    // Check if the math is correct
    const expectedRefund = parseFloat(dispute.refund_amount)
    const lawyerPortion = parseFloat(dispute.original_amount) - expectedRefund
    const expectedCommission = (lawyerPortion * platformCommissionRate) / 100
    const expectedLawyerAmount = lawyerPortion - expectedCommission

    console.log(`\nExpected Calculations:`)
    console.log(`  Client Refund: ${expectedRefund} ETB`)
    console.log(`  Lawyer Portion: ${lawyerPortion} ETB`)
    console.log(`  Expected Commission: ${expectedCommission.toFixed(2)} ETB`)
    console.log(`  Expected Lawyer Amount: ${expectedLawyerAmount.toFixed(2)} ETB`)

    console.log(`\nActual vs Expected:`)
    console.log(`  Lawyer Amount: ${dispute.lawyer_amount} vs ${expectedLawyerAmount.toFixed(2)} ${parseFloat(dispute.lawyer_amount) === expectedLawyerAmount ? '✓' : '✗'}`)
    console.log(`  Commission: ${dispute.commission_amount} vs ${expectedCommission.toFixed(2)} ${parseFloat(dispute.commission_amount) === expectedCommission ? '✓' : '✗'}`)
    console.log(`  Payment Status: ${dispute.payment_status} (should be 'released') ${dispute.payment_status === 'released' ? '✓' : '✗'}`)

    // Check lawyer earnings
    const earnings = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released_earnings
      FROM escrow_payments
      WHERE lawyer_id = ${dispute.lawyer_id}
    `

    console.log(`\nLawyer Total Released Earnings: ${earnings[0].released_earnings} ETB`)
  }

  process.exit(0)
}

checkPartialRefundIssue().catch(console.error)
