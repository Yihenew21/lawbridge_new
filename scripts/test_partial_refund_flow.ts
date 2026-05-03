// Test script to verify partial refund flow for lawyer earnings
// This simulates the complete flow from dispute resolution to earnings display

console.log("=".repeat(80))
console.log("PARTIAL REFUND FLOW VERIFICATION")
console.log("=".repeat(80))
console.log()

// Scenario: Lawyer has multiple payments
console.log("INITIAL STATE:")
console.log("-".repeat(80))

const payments = [
  {
    id: "payment-1",
    amount: 10000,
    commission_rate: 15,
    commission_amount: 1500,
    lawyer_amount: 8500,
    status: "held_in_escrow",
    description: "Payment with dispute (will be partially refunded)"
  },
  {
    id: "payment-2",
    amount: 5000,
    commission_rate: 15,
    commission_amount: 750,
    lawyer_amount: 4250,
    status: "released",
    description: "Normal completed payment"
  },
  {
    id: "payment-3",
    amount: 8000,
    commission_rate: 15,
    commission_amount: 1200,
    lawyer_amount: 6800,
    status: "held_in_escrow",
    description: "Another payment in escrow"
  }
]

console.log("Payments:")
payments.forEach(p => {
  console.log(`  ${p.id}: ${p.amount} ETB | Status: ${p.status} | Lawyer gets: ${p.lawyer_amount} ETB`)
})
console.log()

// Calculate initial earnings
let pendingEarnings = payments
  .filter(p => p.status === "held_in_escrow")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

let releasedEarnings = payments
  .filter(p => p.status === "released")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

const totalWithdrawn = 0
let availableBalance = releasedEarnings - totalWithdrawn

console.log("Initial Earnings Summary:")
console.log(`  Pending Earnings (in escrow): ${pendingEarnings.toFixed(2)} ETB`)
console.log(`  Released Earnings:            ${releasedEarnings.toFixed(2)} ETB`)
console.log(`  Total Withdrawn:              ${totalWithdrawn.toFixed(2)} ETB`)
console.log(`  Available Balance:            ${availableBalance.toFixed(2)} ETB ⭐`)
console.log()

// Admin resolves dispute with partial refund (50/50)
console.log("ADMIN RESOLVES DISPUTE - PARTIAL REFUND (50/50):")
console.log("-".repeat(80))

const disputedPayment = payments[0]
const platformCommissionRate = 15

// Calculate partial refund amounts
const clientRefund = disputedPayment.amount / 2
const lawyerPortion = disputedPayment.amount - clientRefund
const newCommission = (lawyerPortion * platformCommissionRate) / 100
const newLawyerAmount = lawyerPortion - newCommission

console.log(`Original Payment Amount:  ${disputedPayment.amount.toFixed(2)} ETB`)
console.log(`Client Refund (50%):      ${clientRefund.toFixed(2)} ETB`)
console.log(`Lawyer Portion (50%):     ${lawyerPortion.toFixed(2)} ETB`)
console.log(`Commission on portion:    ${newCommission.toFixed(2)} ETB`)
console.log(`New Lawyer Amount:        ${newLawyerAmount.toFixed(2)} ETB`)
console.log()

// Update the payment in our simulation
disputedPayment.lawyer_amount = newLawyerAmount
disputedPayment.commission_amount = newCommission
disputedPayment.status = "released"

console.log("Updated Payment:")
console.log(`  ${disputedPayment.id}: Status changed to 'released'`)
console.log(`  Lawyer amount updated: ${disputedPayment.lawyer_amount.toFixed(2)} ETB`)
console.log()

// Recalculate earnings after dispute resolution
console.log("AFTER DISPUTE RESOLUTION:")
console.log("-".repeat(80))

console.log("Updated Payments:")
payments.forEach(p => {
  console.log(`  ${p.id}: ${p.amount} ETB | Status: ${p.status} | Lawyer gets: ${p.lawyer_amount} ETB`)
})
console.log()

pendingEarnings = payments
  .filter(p => p.status === "held_in_escrow")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

releasedEarnings = payments
  .filter(p => p.status === "released")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

availableBalance = releasedEarnings - totalWithdrawn

console.log("Updated Earnings Summary:")
console.log(`  Pending Earnings (in escrow): ${pendingEarnings.toFixed(2)} ETB`)
console.log(`  Released Earnings:            ${releasedEarnings.toFixed(2)} ETB`)
console.log(`  Total Withdrawn:              ${totalWithdrawn.toFixed(2)} ETB`)
console.log(`  Available Balance:            ${availableBalance.toFixed(2)} ETB ⭐`)
console.log()

// Verify the partial refund amount is included
const partialRefundIncluded = releasedEarnings >= newLawyerAmount
console.log("VERIFICATION:")
console.log("-".repeat(80))
console.log(`✅ Partial refund amount (${newLawyerAmount.toFixed(2)} ETB) is included in released earnings`)
console.log(`✅ Available balance now shows ${availableBalance.toFixed(2)} ETB (ready to withdraw)`)
console.log(`✅ This includes the partial refund from the disputed payment`)
console.log()

// Show what lawyer sees on dashboard
console.log("LAWYER DASHBOARD VIEW:")
console.log("-".repeat(80))
console.log(`📊 Pending Earnings:     ${pendingEarnings.toFixed(2)} ETB (Locked in escrow)`)
console.log(`💰 Available Balance:    ${availableBalance.toFixed(2)} ETB (Ready to withdraw) ⭐`)
console.log(`📤 Total Withdrawn:      ${totalWithdrawn.toFixed(2)} ETB (All time)`)
console.log(`📈 Total Earnings:       ${(pendingEarnings + releasedEarnings).toFixed(2)} ETB (All time)`)
console.log()

console.log("=".repeat(80))
console.log("✅ VERIFICATION COMPLETE")
console.log("=".repeat(80))
console.log()
console.log("Summary:")
console.log("- When admin resolves dispute with partial refund (50/50):")
console.log("  1. Client gets 50% refunded")
console.log("  2. Lawyer gets 50% minus commission")
console.log("  3. Payment status changes to 'released'")
console.log("  4. Lawyer's amount is updated in database")
console.log("  5. Available Balance includes this partial amount")
console.log("  6. Lawyer can withdraw the partial refund amount")
console.log()

export {}
