import { getDb } from "../lib/db"

async function fixBrokenPartialRefunds() {
  const sql = getDb()

  console.log("=== Fixing Broken Partial Refunds ===\n")

  // Get platform commission rate
  const settingsResult = await sql`
    SELECT value FROM platform_settings WHERE key = 'commission_rate'
  `
  const platformCommissionRate = settingsResult.length > 0
    ? parseFloat(settingsResult[0].value)
    : 15.0

  console.log(`Platform Commission Rate: ${platformCommissionRate}%\n`)

  // Find all partial refund disputes where the calculations are wrong
  const brokenDisputes = await sql`
    SELECT
      pd.id as dispute_id,
      pd.payment_id,
      pd.refund_amount,
      ep.transaction_id,
      ep.amount as original_amount,
      ep.lawyer_amount,
      ep.commission_amount,
      ep.status as payment_status
    FROM payment_disputes pd
    JOIN escrow_payments ep ON ep.id = pd.payment_id
    WHERE pd.resolution_outcome = 'partial_refund'
    AND pd.status = 'resolved_refund'
  `

  console.log(`Found ${brokenDisputes.length} partial refund disputes to check\n`)

  let fixedCount = 0

  for (const dispute of brokenDisputes) {
    const refundAmount = parseFloat(dispute.refund_amount)
    const originalAmount = parseFloat(dispute.original_amount)
    const currentLawyerAmount = parseFloat(dispute.lawyer_amount)
    const currentCommission = parseFloat(dispute.commission_amount)

    // Calculate what the values SHOULD be
    const lawyerPortion = originalAmount - refundAmount
    const expectedCommission = (lawyerPortion * platformCommissionRate) / 100
    const expectedLawyerAmount = lawyerPortion - expectedCommission

    // Check if values are incorrect (with small tolerance for floating point)
    const lawyerAmountWrong = Math.abs(currentLawyerAmount - expectedLawyerAmount) > 0.01
    const commissionWrong = Math.abs(currentCommission - expectedCommission) > 0.01
    const statusWrong = dispute.payment_status === 'refunded'

    if (lawyerAmountWrong || commissionWrong || statusWrong) {
      console.log(`\n--- Fixing Transaction: ${dispute.transaction_id} ---`)
      console.log(`Original Amount: ${originalAmount} ETB`)
      console.log(`Client Refund: ${refundAmount} ETB`)
      console.log(`Lawyer Portion: ${lawyerPortion} ETB`)
      console.log(`\nCurrent (Wrong):`)
      console.log(`  Lawyer Amount: ${currentLawyerAmount} ETB`)
      console.log(`  Commission: ${currentCommission} ETB`)
      console.log(`  Status: ${dispute.payment_status}`)
      console.log(`\nExpected (Correct):`)
      console.log(`  Lawyer Amount: ${expectedLawyerAmount.toFixed(2)} ETB`)
      console.log(`  Commission: ${expectedCommission.toFixed(2)} ETB`)
      console.log(`  Status: released`)

      // Update the payment record
      await sql`
        UPDATE escrow_payments
        SET
          lawyer_amount = ${expectedLawyerAmount},
          commission_amount = ${expectedCommission},
          status = 'released',
          released_at = COALESCE(released_at, NOW()),
          updated_at = NOW()
        WHERE id = ${dispute.payment_id}
      `

      console.log(`✓ Fixed!`)
      fixedCount++
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Total disputes checked: ${brokenDisputes.length}`)
  console.log(`Disputes fixed: ${fixedCount}`)
  console.log(`Disputes already correct: ${brokenDisputes.length - fixedCount}`)

  process.exit(0)
}

fixBrokenPartialRefunds().catch(console.error)
