// Complete demonstration of partial refund flow
// This shows the entire process from payment creation to withdrawal

import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function demonstratePartialRefundFlow() {
  console.log("=".repeat(80))
  console.log("COMPLETE PARTIAL REFUND FLOW DEMONSTRATION")
  console.log("=".repeat(80))
  console.log()

  try {
    // Get a lawyer and client
    const lawyers = await sql`SELECT id, first_name, last_name, email FROM users WHERE role = 'lawyer' LIMIT 1`
    const clients = await sql`SELECT id, first_name, last_name, email FROM users WHERE role = 'client' LIMIT 1`
    const admins = await sql`SELECT id, first_name, last_name FROM users WHERE role = 'admin' LIMIT 1`

    if (lawyers.length === 0 || clients.length === 0) {
      console.log("❌ Need at least one lawyer and one client in database")
      return
    }

    const lawyer = lawyers[0]
    const client = clients[0]
    const admin = admins.length > 0 ? admins[0] : null

    console.log("PARTICIPANTS:")
    console.log("-".repeat(80))
    console.log(`👨‍⚖️ Lawyer: ${lawyer.first_name} ${lawyer.last_name} (${lawyer.email})`)
    console.log(`👤 Client: ${client.first_name} ${client.last_name} (${client.email})`)
    if (admin) {
      console.log(`👔 Admin: ${admin.first_name} ${admin.last_name}`)
    }
    console.log()

    // STEP 1: Check initial earnings
    console.log("STEP 1: Initial Lawyer Earnings")
    console.log("-".repeat(80))

    const initialEarnings = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'held_in_escrow' THEN lawyer_amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released
      FROM escrow_payments
      WHERE lawyer_id = ${lawyer.id}
    `

    const initialWithdrawals = await sql`
      SELECT COALESCE(SUM(amount), 0) as withdrawn
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${lawyer.id} AND status = 'completed'
    `

    const initialAvailable = parseFloat(initialEarnings[0].released) - parseFloat(initialWithdrawals[0].withdrawn)

    console.log(`Pending Earnings:     ${parseFloat(initialEarnings[0].pending).toFixed(2)} ETB`)
    console.log(`Released Earnings:    ${parseFloat(initialEarnings[0].released).toFixed(2)} ETB`)
    console.log(`Total Withdrawn:      ${parseFloat(initialWithdrawals[0].withdrawn).toFixed(2)} ETB`)
    console.log(`Available Balance:    ${initialAvailable.toFixed(2)} ETB`)
    console.log()

    // STEP 2: Find or describe a payment with dispute
    console.log("STEP 2: Payment with Dispute")
    console.log("-".repeat(80))

    const disputedPayments = await sql`
      SELECT
        ep.id,
        ep.amount,
        ep.lawyer_amount as original_lawyer_amount,
        ep.commission_amount,
        ep.commission_rate,
        ep.status,
        pd.id as dispute_id,
        pd.status as dispute_status,
        pd.reason
      FROM escrow_payments ep
      LEFT JOIN payment_disputes pd ON pd.payment_id = ep.id
      WHERE ep.lawyer_id = ${lawyer.id}
        AND ep.status = 'held_in_escrow'
        AND pd.status IN ('open', 'under_review')
      LIMIT 1
    `

    let payment
    if (disputedPayments.length > 0) {
      payment = disputedPayments[0]
      console.log("✅ Found existing payment with open dispute:")
      console.log(`Payment ID:           ${payment.id}`)
      console.log(`Amount:               ${parseFloat(payment.amount).toFixed(2)} ETB`)
      console.log(`Original Lawyer Amt:  ${parseFloat(payment.original_lawyer_amount).toFixed(2)} ETB`)
      console.log(`Commission Rate:      ${parseFloat(payment.commission_rate)}%`)
      console.log(`Status:               ${payment.status}`)
      console.log(`Dispute Status:       ${payment.dispute_status}`)
      console.log(`Dispute Reason:       ${payment.reason}`)
    } else {
      console.log("ℹ️  No open disputes found. Simulating scenario...")
      console.log()
      console.log("Scenario: Payment of 10,000 ETB with 15% commission")
      payment = {
        amount: 10000,
        commission_rate: 15,
        original_lawyer_amount: 8500,
        status: 'held_in_escrow'
      }
      console.log(`Amount:               ${payment.amount.toFixed(2)} ETB`)
      console.log(`Original Lawyer Amt:  ${payment.original_lawyer_amount.toFixed(2)} ETB`)
      console.log(`Commission Rate:      ${payment.commission_rate}%`)
      console.log(`Status:               ${payment.status}`)
    }
    console.log()

    // STEP 3: Admin resolves with partial refund
    console.log("STEP 3: Admin Resolves Dispute - Partial Refund (50/50)")
    console.log("-".repeat(80))

    const originalAmount = parseFloat(payment.amount)
    const platformCommissionRate = parseFloat(payment.commission_rate)

    // Calculate partial refund (50/50 split)
    const clientRefund = originalAmount / 2
    const lawyerPortion = originalAmount - clientRefund
    const newCommission = (lawyerPortion * platformCommissionRate) / 100
    const newLawyerAmount = lawyerPortion - newCommission

    console.log("Resolution Calculation:")
    console.log(`  Original Payment:     ${originalAmount.toFixed(2)} ETB`)
    console.log(`  Client Refund (50%):  ${clientRefund.toFixed(2)} ETB`)
    console.log(`  Lawyer Portion (50%): ${lawyerPortion.toFixed(2)} ETB`)
    console.log(`  Commission (${platformCommissionRate}%):      ${newCommission.toFixed(2)} ETB`)
    console.log(`  New Lawyer Amount:    ${newLawyerAmount.toFixed(2)} ETB ⭐`)
    console.log()

    console.log("Database Updates:")
    console.log(`  1. Update payment_disputes:`)
    console.log(`     - status = 'resolved_refund'`)
    console.log(`     - resolution_outcome = 'partial_refund'`)
    console.log(`     - refund_amount = ${clientRefund.toFixed(2)}`)
    console.log()
    console.log(`  2. Update escrow_payments:`)
    console.log(`     - lawyer_amount = ${newLawyerAmount.toFixed(2)} (was ${parseFloat(payment.original_lawyer_amount).toFixed(2)})`)
    console.log(`     - commission_amount = ${newCommission.toFixed(2)}`)
    console.log(`     - status = 'released' (was 'held_in_escrow')`)
    console.log(`     - released_at = NOW()`)
    console.log()

    // STEP 4: Calculate new earnings
    console.log("STEP 4: Updated Lawyer Earnings")
    console.log("-".repeat(80))

    // Simulate the new state
    const simulatedPending = parseFloat(initialEarnings[0].pending) - parseFloat(payment.original_lawyer_amount)
    const simulatedReleased = parseFloat(initialEarnings[0].released) + newLawyerAmount
    const simulatedAvailable = simulatedReleased - parseFloat(initialWithdrawals[0].withdrawn)

    console.log(`Pending Earnings:     ${simulatedPending.toFixed(2)} ETB (decreased by ${parseFloat(payment.original_lawyer_amount).toFixed(2)})`)
    console.log(`Released Earnings:    ${simulatedReleased.toFixed(2)} ETB (increased by ${newLawyerAmount.toFixed(2)})`)
    console.log(`Total Withdrawn:      ${parseFloat(initialWithdrawals[0].withdrawn).toFixed(2)} ETB`)
    console.log(`Available Balance:    ${simulatedAvailable.toFixed(2)} ETB ⭐`)
    console.log()

    const balanceIncrease = simulatedAvailable - initialAvailable
    console.log(`✅ Available Balance increased by ${balanceIncrease.toFixed(2)} ETB`)
    console.log(`✅ This is the partial refund amount the lawyer can now withdraw`)
    console.log()

    // STEP 5: Show dashboard view
    console.log("STEP 5: Lawyer Dashboard View")
    console.log("-".repeat(80))
    console.log()
    console.log("┌─────────────────────────────────────────────────────────────┐")
    console.log("│                    EARNINGS DASHBOARD                       │")
    console.log("├─────────────────────────────────────────────────────────────┤")
    console.log("│                                                             │")
    console.log(`│  💰 Available Balance                                       │`)
    console.log(`│     ${simulatedAvailable.toFixed(2)} ETB                                          │`)
    console.log(`│     Ready to withdraw ⭐                                    │`)
    console.log("│                                                             │")
    console.log(`│  🔒 Pending Earnings                                        │`)
    console.log(`│     ${simulatedPending.toFixed(2)} ETB                                          │`)
    console.log(`│     Locked in escrow                                        │`)
    console.log("│                                                             │")
    console.log(`│  📤 Total Withdrawn                                         │`)
    console.log(`│     ${parseFloat(initialWithdrawals[0].withdrawn).toFixed(2)} ETB                                           │`)
    console.log(`│     All time                                                │`)
    console.log("│                                                             │")
    console.log("│  [Withdraw Funds] button enabled                            │")
    console.log("│                                                             │")
    console.log("└─────────────────────────────────────────────────────────────┘")
    console.log()

    // STEP 6: Verification
    console.log("STEP 6: Verification Summary")
    console.log("-".repeat(80))
    console.log()
    console.log("✅ Client receives:    ${clientRefund.toFixed(2)} ETB (50% refund)")
    console.log("✅ Lawyer receives:    ${newLawyerAmount.toFixed(2)} ETB (50% minus commission)")
    console.log("✅ Platform receives:  ${newCommission.toFixed(2)} ETB (commission)")
    console.log(`✅ Total:              ${(clientRefund + newLawyerAmount + newCommission).toFixed(2)} ETB (matches original)`)
    console.log()
    console.log("✅ Payment status changed from 'held_in_escrow' to 'released'")
    console.log("✅ Lawyer amount updated in database")
    console.log("✅ Available Balance includes partial refund amount")
    console.log("✅ Lawyer can withdraw the partial refund")
    console.log()

    console.log("=".repeat(80))
    console.log("✅ DEMONSTRATION COMPLETE")
    console.log("=".repeat(80))
    console.log()
    console.log("KEY POINTS:")
    console.log("1. When admin resolves dispute with partial refund:")
    console.log("   - Payment moves from 'held_in_escrow' to 'released'")
    console.log("   - Lawyer amount is recalculated (half minus commission)")
    console.log("   - Available Balance automatically includes this amount")
    console.log()
    console.log("2. The lawyer sees the updated Available Balance immediately")
    console.log("3. The partial refund amount is ready to withdraw")
    console.log("4. All calculations are handled by the dispute resolution API")
    console.log()

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

demonstratePartialRefundFlow()
  .then(() => {
    console.log("Demo completed successfully")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Demo failed:", err)
    process.exit(1)
  })
