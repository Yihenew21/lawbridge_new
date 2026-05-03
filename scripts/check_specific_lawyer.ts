// Check specific lawyer's earnings and disputes
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function checkLawyer() {
  console.log("=".repeat(80))
  console.log("Checking Lawyer: yibestlawyer@gmail.com")
  console.log("=".repeat(80))
  console.log()

  try {
    // Get the lawyer
    const lawyers = await sql`
      SELECT id, first_name, last_name, email
      FROM users
      WHERE email = 'yibestlawyer@gmail.com'
    `

    if (lawyers.length === 0) {
      console.log("❌ Lawyer not found")
      return
    }

    const lawyer = lawyers[0]
    console.log(`Lawyer: ${lawyer.first_name} ${lawyer.last_name}`)
    console.log(`ID: ${lawyer.id}`)
    console.log()

    // Get all payments
    const allPayments = await sql`
      SELECT
        ep.id,
        ep.transaction_id,
        ep.amount,
        ep.lawyer_amount,
        ep.commission_amount,
        ep.status,
        ep.created_at,
        ep.released_at,
        pd.id as dispute_id,
        pd.status as dispute_status,
        pd.resolution_outcome,
        pd.refund_amount,
        pd.resolved_at
      FROM escrow_payments ep
      LEFT JOIN payment_disputes pd ON pd.payment_id = ep.id
      WHERE ep.lawyer_id = ${lawyer.id}
      ORDER BY ep.created_at DESC
    `

    console.log(`Total Payments: ${allPayments.length}`)
    console.log()

    // Group by status
    const byStatus = {
      pending_verification: allPayments.filter(p => p.status === 'pending_verification'),
      held_in_escrow: allPayments.filter(p => p.status === 'held_in_escrow'),
      released: allPayments.filter(p => p.status === 'released'),
      disputed: allPayments.filter(p => p.status === 'disputed'),
      refunded: allPayments.filter(p => p.status === 'refunded')
    }

    console.log("Payments by Status:")
    console.log(`  Pending Verification: ${byStatus.pending_verification.length}`)
    console.log(`  Held in Escrow: ${byStatus.held_in_escrow.length}`)
    console.log(`  Released: ${byStatus.released.length}`)
    console.log(`  Disputed: ${byStatus.disputed.length}`)
    console.log(`  Refunded: ${byStatus.refunded.length}`)
    console.log()

    // Calculate earnings
    const pendingEarnings = byStatus.held_in_escrow.reduce((sum, p) => sum + parseFloat(p.lawyer_amount), 0)
    const releasedEarnings = byStatus.released.reduce((sum, p) => sum + parseFloat(p.lawyer_amount), 0)

    const withdrawals = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${lawyer.id} AND status = 'completed'
    `

    const totalWithdrawn = parseFloat(withdrawals[0].total_withdrawn)
    const availableBalance = releasedEarnings - totalWithdrawn

    console.log("Earnings Summary:")
    console.log(`  Pending Earnings: ${pendingEarnings.toFixed(2)} ETB`)
    console.log(`  Released Earnings: ${releasedEarnings.toFixed(2)} ETB`)
    console.log(`  Total Withdrawn: ${totalWithdrawn.toFixed(2)} ETB`)
    console.log(`  Available Balance: ${availableBalance.toFixed(2)} ETB ⭐`)
    console.log()

    // Show disputes
    const disputes = allPayments.filter(p => p.dispute_id)
    if (disputes.length > 0) {
      console.log("Disputes:")
      disputes.forEach((p, i) => {
        console.log(`  ${i + 1}. Payment ${p.transaction_id}`)
        console.log(`     Original Amount: ${parseFloat(p.amount).toFixed(2)} ETB`)
        console.log(`     Lawyer Amount: ${parseFloat(p.lawyer_amount).toFixed(2)} ETB`)
        console.log(`     Payment Status: ${p.status}`)
        console.log(`     Dispute Status: ${p.dispute_status}`)
        console.log(`     Resolution: ${p.resolution_outcome || 'N/A'}`)
        console.log(`     Refund Amount: ${p.refund_amount ? parseFloat(p.refund_amount).toFixed(2) : '0.00'} ETB`)
        console.log(`     Resolved At: ${p.resolved_at || 'Not resolved'}`)
        console.log()
      })
    }

    // Show all released payments
    console.log("Released Payments Detail:")
    byStatus.released.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.transaction_id}`)
      console.log(`     Amount: ${parseFloat(p.amount).toFixed(2)} ETB`)
      console.log(`     Lawyer Gets: ${parseFloat(p.lawyer_amount).toFixed(2)} ETB`)
      console.log(`     Released: ${p.released_at}`)
      if (p.dispute_id) {
        console.log(`     ⚠️  Had Dispute: ${p.resolution_outcome}`)
      }
      console.log()
    })

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

checkLawyer()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
