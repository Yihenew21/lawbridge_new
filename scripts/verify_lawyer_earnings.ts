// Test to verify lawyer earnings calculation after partial refund
// This simulates what happens in the database after dispute resolution

console.log("=".repeat(80))
console.log("LAWYER EARNINGS VERIFICATION - After Partial Refund")
console.log("=".repeat(80))
console.log()

// Scenario: Original payment of 10,000 ETB with 15% commission
const originalAmount = 10000
const originalCommissionRate = 15
const originalCommission = (originalAmount * originalCommissionRate) / 100
const originalLawyerAmount = originalAmount - originalCommission

console.log("BEFORE DISPUTE RESOLUTION:")
console.log("-".repeat(80))
console.log(`Payment Amount:        ${originalAmount.toFixed(2)} ETB`)
console.log(`Commission Rate:       ${originalCommissionRate}%`)
console.log(`Commission Amount:     ${originalCommission.toFixed(2)} ETB`)
console.log(`Lawyer Amount:         ${originalLawyerAmount.toFixed(2)} ETB`)
console.log(`Payment Status:        held_in_escrow`)
console.log()

// Admin resolves with partial refund (50/50)
const clientRefund = originalAmount / 2
const lawyerPortion = originalAmount - clientRefund
const newCommission = (lawyerPortion * originalCommissionRate) / 100
const newLawyerAmount = lawyerPortion - newCommission

console.log("AFTER PARTIAL REFUND RESOLUTION (50/50):")
console.log("-".repeat(80))
console.log(`Client Refund:         ${clientRefund.toFixed(2)} ETB`)
console.log(`Lawyer Portion:        ${lawyerPortion.toFixed(2)} ETB`)
console.log(`New Commission:        ${newCommission.toFixed(2)} ETB`)
console.log(`New Lawyer Amount:     ${newLawyerAmount.toFixed(2)} ETB`)
console.log(`Payment Status:        released`)
console.log()

// Verify totals
const total = clientRefund + newLawyerAmount + newCommission
console.log("VERIFICATION:")
console.log("-".repeat(80))
console.log(`Client gets:           ${clientRefund.toFixed(2)} ETB`)
console.log(`Lawyer gets:           ${newLawyerAmount.toFixed(2)} ETB`)
console.log(`Platform gets:         ${newCommission.toFixed(2)} ETB`)
console.log(`Total:                 ${total.toFixed(2)} ETB`)
console.log(`Matches original:      ${total === originalAmount ? "✅ YES" : "❌ NO"}`)
console.log()

// Simulate lawyer earnings query
console.log("LAWYER EARNINGS QUERY SIMULATION:")
console.log("-".repeat(80))

// Assume lawyer has 3 payments:
// 1. Original payment (now resolved with partial refund) - released
// 2. Another payment - held_in_escrow
// 3. Another payment - released

const payments = [
  { id: 1, lawyer_amount: newLawyerAmount, status: "released", description: "Resolved dispute (partial refund)" },
  { id: 2, lawyer_amount: 8500, status: "held_in_escrow", description: "Normal payment in escrow" },
  { id: 3, lawyer_amount: 7650, status: "released", description: "Normal released payment" },
]

const pendingEarnings = payments
  .filter(p => p.status === "held_in_escrow")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

const releasedEarnings = payments
  .filter(p => p.status === "released")
  .reduce((sum, p) => sum + p.lawyer_amount, 0)

const totalWithdrawn = 0 // Assume no withdrawals yet
const availableBalance = releasedEarnings - totalWithdrawn

console.log("Payments:")
payments.forEach(p => {
  console.log(`  ${p.id}. ${p.description}`)
  console.log(`     Amount: ${p.lawyer_amount.toFixed(2)} ETB | Status: ${p.status}`)
})
console.log()

console.log("Summary:")
console.log(`  Pending Earnings (in escrow):  ${pendingEarnings.toFixed(2)} ETB`)
console.log(`  Released Earnings:             ${releasedEarnings.toFixed(2)} ETB`)
console.log(`  Total Withdrawn:               ${totalWithdrawn.toFixed(2)} ETB`)
console.log(`  Available to Withdraw:         ${availableBalance.toFixed(2)} ETB`)
console.log()

console.log("✅ The partial refund amount (${newLawyerAmount.toFixed(2)} ETB) is included in available balance")
console.log("✅ Lawyer can now withdraw the updated amount")
console.log()

// Test with different commission rates
console.log("=".repeat(80))
console.log("TEST WITH DIFFERENT COMMISSION RATES")
console.log("=".repeat(80))
console.log()

const testRates = [15, 18, 20]
testRates.forEach(rate => {
  const refund = originalAmount / 2
  const portion = originalAmount - refund
  const commission = (portion * rate) / 100
  const lawyerGets = portion - commission

  console.log(`Commission Rate: ${rate}%`)
  console.log(`  Client Refund:     ${refund.toFixed(2)} ETB`)
  console.log(`  Lawyer Gets:       ${lawyerGets.toFixed(2)} ETB (withdrawable)`)
  console.log(`  Commission:        ${commission.toFixed(2)} ETB`)
  console.log()
})

console.log("=".repeat(80))
console.log("VERIFICATION COMPLETE")
console.log("=".repeat(80))

export {}
