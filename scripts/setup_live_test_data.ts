// Setup live test data for partial refund verification
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function setupLiveTestData() {
  console.log("=".repeat(80))
  console.log("SETUP LIVE TEST DATA - Partial Refund")
  console.log("=".repeat(80))
  console.log()

  try {
    // Get test users
    const lawyers = await sql`SELECT id, first_name, last_name, email FROM users WHERE role = 'lawyer' LIMIT 1`
    const clients = await sql`SELECT id, first_name, last_name, email FROM users WHERE role = 'client' LIMIT 1`
    const admins = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    const bankAccounts = await sql`SELECT id FROM organization_bank_accounts LIMIT 1`

    if (lawyers.length === 0 || clients.length === 0 || bankAccounts.length === 0) {
      console.log("❌ Missing required data")
      return
    }

    const lawyer = lawyers[0]
    const client = clients[0]
    const admin = admins.length > 0 ? admins[0] : null

    console.log("Creating test data for:")
    console.log(`Lawyer: ${lawyer.first_name} ${lawyer.last_name} (${lawyer.email})`)
    console.log()

    // Create 3 payments with different scenarios
    const scenarios = [
      {
        amount: 10000,
        description: "Contract Review - Resolved with Partial Refund",
        hasDispute: true,
        resolveDispute: true
      },
      {
        amount: 8000,
        description: "Legal Consultation - In Escrow",
        hasDispute: false,
        resolveDispute: false
      },
      {
        amount: 5000,
        description: "Document Preparation - Completed",
        hasDispute: false,
        resolveDispute: false,
        released: true
      }
    ]

    console.log("Creating test payments...")
    console.log()

    for (const scenario of scenarios) {
      const commissionRate = 15
      const commission = (scenario.amount * commissionRate) / 100
      const lawyerAmount = scenario.amount - commission

      // Create payment
      const payment = await sql`
        INSERT INTO escrow_payments (
          client_id,
          lawyer_id,
          bank_account_id,
          transaction_id,
          amount,
          commission_rate,
          commission_amount,
          lawyer_amount,
          status,
          case_description,
          client_name,
          client_email,
          client_phone,
          lawyer_name,
          lawyer_email,
          released_at
        ) VALUES (
          ${client.id},
          ${lawyer.id},
          ${bankAccounts[0].id},
          ${'LIVE-TEST-' + Date.now() + '-' + Math.random().toString(36).substring(7)},
          ${scenario.amount},
          ${commissionRate},
          ${commission},
          ${lawyerAmount},
          ${scenario.released ? 'released' : 'held_in_escrow'},
          ${scenario.description},
          ${client.first_name + ' ' + client.last_name},
          ${client.email},
          '0911111111',
          ${lawyer.first_name + ' ' + lawyer.last_name},
          ${lawyer.email},
          ${scenario.released ? new Date() : null}
        )
        RETURNING id, amount, lawyer_amount, status
      `

      console.log(`✅ Created: ${scenario.description}`)
      console.log(`   Amount: ${scenario.amount} ETB | Lawyer: ${lawyerAmount} ETB | Status: ${payment[0].status}`)

      // Create and resolve dispute if needed
      if (scenario.hasDispute) {
        const dispute = await sql`
          INSERT INTO payment_disputes (
            payment_id,
            raised_by,
            reason,
            status
          ) VALUES (
            ${payment[0].id},
            ${client.id},
            'Service not completed as agreed',
            'open'
          )
          RETURNING id
        `

        console.log(`   📋 Created dispute`)

        if (scenario.resolveDispute) {
          // Resolve with partial refund (50/50)
          const clientRefund = scenario.amount / 2
          const lawyerPortion = scenario.amount - clientRefund
          const newCommission = (lawyerPortion * commissionRate) / 100
          const newLawyerAmount = lawyerPortion - newCommission

          await sql`BEGIN`

          try {
            await sql`
              UPDATE payment_disputes
              SET
                status = 'resolved_refund',
                resolution_outcome = 'partial_refund',
                refund_amount = ${clientRefund},
                admin_notes = 'Resolved with 50/50 split - both parties agreed',
                resolved_by = ${admin?.id || client.id},
                resolved_at = NOW(),
                updated_at = NOW()
              WHERE id = ${dispute[0].id}
            `

            await sql`
              UPDATE escrow_payments
              SET
                lawyer_amount = ${newLawyerAmount},
                commission_amount = ${newCommission},
                status = 'released',
                released_at = NOW(),
                updated_at = NOW()
              WHERE id = ${payment[0].id}
            `

            await sql`COMMIT`

            console.log(`   ✅ Resolved with partial refund`)
            console.log(`      Client refund: ${clientRefund} ETB`)
            console.log(`      Lawyer gets: ${newLawyerAmount} ETB (now in Available Balance)`)
          } catch (error) {
            await sql`ROLLBACK`
            throw error
          }
        }
      }

      console.log()
    }

    // Get final earnings summary
    console.log("=".repeat(80))
    console.log("CURRENT EARNINGS SUMMARY")
    console.log("=".repeat(80))
    console.log()

    const earnings = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'held_in_escrow' THEN lawyer_amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'released' THEN lawyer_amount ELSE 0 END), 0) as released,
        COUNT(CASE WHEN status = 'held_in_escrow' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'released' THEN 1 END) as released_count
      FROM escrow_payments
      WHERE lawyer_id = ${lawyer.id}
    `

    const withdrawals = await sql`
      SELECT COALESCE(SUM(amount), 0) as withdrawn
      FROM lawyer_withdrawals
      WHERE lawyer_id = ${lawyer.id} AND status = 'completed'
    `

    const pending = parseFloat(earnings[0].pending)
    const released = parseFloat(earnings[0].released)
    const withdrawn = parseFloat(withdrawals[0].withdrawn)
    const available = released - withdrawn

    console.log(`📊 Pending Earnings:     ${pending.toFixed(2)} ETB (${earnings[0].pending_count} payments)`)
    console.log(`💰 Available Balance:    ${available.toFixed(2)} ETB (${earnings[0].released_count} payments) ⭐`)
    console.log(`📤 Total Withdrawn:      ${withdrawn.toFixed(2)} ETB`)
    console.log(`📈 Total Earnings:       ${(pending + released).toFixed(2)} ETB`)
    console.log()

    console.log("=".repeat(80))
    console.log("✅ TEST DATA CREATED SUCCESSFULLY")
    console.log("=".repeat(80))
    console.log()
    console.log("🌐 Open your browser and navigate to:")
    console.log()
    console.log("   http://localhost:3001/dashboard/lawyer/earnings")
    console.log()
    console.log("You should see:")
    console.log(`- Available Balance: ${available.toFixed(2)} ETB (includes partial refund)`)
    console.log(`- Pending Earnings: ${pending.toFixed(2)} ETB`)
    console.log("- The partial refund amount is ready to withdraw")
    console.log()
    console.log("Login credentials:")
    console.log(`Email: ${lawyer.email}`)
    console.log()

  } catch (error) {
    console.error("❌ Error:", error)
    throw error
  }
}

setupLiveTestData()
  .then(() => {
    console.log("Setup completed successfully")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Setup failed:", err)
    process.exit(1)
  })
