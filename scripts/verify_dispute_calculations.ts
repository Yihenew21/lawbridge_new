// Dispute Resolution Calculation Test
// Run this to verify the partial refund calculations are correct

interface TestCase {
  name: string
  originalAmount: number
  commissionRate: number
  refundAmount?: number
  expected: {
    clientRefund: number
    lawyerPortion: number
    commission: number
    lawyerGets: number
  }
}

const testCases: TestCase[] = [
  {
    name: "Default 50/50 Split",
    originalAmount: 10000,
    commissionRate: 15,
    expected: {
      clientRefund: 5000,
      lawyerPortion: 5000,
      commission: 750,
      lawyerGets: 4250
    }
  },
  {
    name: "Custom 60/40 Split (Client gets 60%)",
    originalAmount: 10000,
    commissionRate: 15,
    refundAmount: 6000,
    expected: {
      clientRefund: 6000,
      lawyerPortion: 4000,
      commission: 600,
      lawyerGets: 3400
    }
  },
  {
    name: "Custom 30/70 Split (Client gets 30%)",
    originalAmount: 10000,
    commissionRate: 15,
    refundAmount: 3000,
    expected: {
      clientRefund: 3000,
      lawyerPortion: 7000,
      commission: 1050,
      lawyerGets: 5950
    }
  },
  {
    name: "Small Amount 50/50",
    originalAmount: 1000,
    commissionRate: 15,
    expected: {
      clientRefund: 500,
      lawyerPortion: 500,
      commission: 75,
      lawyerGets: 425
    }
  },
  {
    name: "Large Amount 50/50",
    originalAmount: 100000,
    commissionRate: 15,
    expected: {
      clientRefund: 50000,
      lawyerPortion: 50000,
      commission: 7500,
      lawyerGets: 42500
    }
  }
]

function calculatePartialRefund(
  originalAmount: number,
  commissionRate: number,
  refundAmount?: number
) {
  // This matches the logic in the API endpoint
  const clientRefund = refundAmount !== undefined
    ? refundAmount
    : originalAmount / 2

  const lawyerPortion = originalAmount - clientRefund
  const commission = (lawyerPortion * commissionRate) / 100
  const lawyerGets = lawyerPortion - commission

  return {
    clientRefund,
    lawyerPortion,
    commission,
    lawyerGets
  }
}

function runTests() {
  console.log("=".repeat(80))
  console.log("DISPUTE RESOLUTION CALCULATION VERIFICATION")
  console.log("=".repeat(80))
  console.log()

  let allPassed = true

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`)
    console.log("-".repeat(80))
    console.log(`Original Amount: ${testCase.originalAmount} ETB`)
    console.log(`Commission Rate: ${testCase.commissionRate}%`)
    if (testCase.refundAmount) {
      console.log(`Custom Refund: ${testCase.refundAmount} ETB`)
    }
    console.log()

    const result = calculatePartialRefund(
      testCase.originalAmount,
      testCase.commissionRate,
      testCase.refundAmount
    )

    console.log("Results:")
    console.log(`  Client Refund:     ${result.clientRefund.toFixed(2)} ETB`)
    console.log(`  Lawyer Portion:    ${result.lawyerPortion.toFixed(2)} ETB`)
    console.log(`  Commission:        ${result.commission.toFixed(2)} ETB`)
    console.log(`  Lawyer Gets:       ${result.lawyerGets.toFixed(2)} ETB`)
    console.log()

    // Verify calculations
    const clientMatch = Math.abs(result.clientRefund - testCase.expected.clientRefund) < 0.01
    const lawyerPortionMatch = Math.abs(result.lawyerPortion - testCase.expected.lawyerPortion) < 0.01
    const commissionMatch = Math.abs(result.commission - testCase.expected.commission) < 0.01
    const lawyerGetsMatch = Math.abs(result.lawyerGets - testCase.expected.lawyerGets) < 0.01

    const passed = clientMatch && lawyerPortionMatch && commissionMatch && lawyerGetsMatch

    if (passed) {
      console.log("✅ PASSED")
    } else {
      console.log("❌ FAILED")
      console.log("Expected:")
      console.log(`  Client Refund:     ${testCase.expected.clientRefund.toFixed(2)} ETB`)
      console.log(`  Lawyer Portion:    ${testCase.expected.lawyerPortion.toFixed(2)} ETB`)
      console.log(`  Commission:        ${testCase.expected.commission.toFixed(2)} ETB`)
      console.log(`  Lawyer Gets:       ${testCase.expected.lawyerGets.toFixed(2)} ETB`)
      allPassed = false
    }

    // Verify total adds up
    const total = result.clientRefund + result.lawyerGets + result.commission
    const totalMatch = Math.abs(total - testCase.originalAmount) < 0.01

    console.log()
    console.log(`Verification: ${result.clientRefund.toFixed(2)} + ${result.lawyerGets.toFixed(2)} + ${result.commission.toFixed(2)} = ${total.toFixed(2)} ETB`)
    console.log(`Total matches original: ${totalMatch ? "✅ YES" : "❌ NO"}`)
    console.log()
    console.log()
  })

  console.log("=".repeat(80))
  if (allPassed) {
    console.log("✅ ALL TESTS PASSED")
  } else {
    console.log("❌ SOME TESTS FAILED")
  }
  console.log("=".repeat(80))
}

// Run tests
runTests()

// Export for use in other files
export { calculatePartialRefund, testCases }
