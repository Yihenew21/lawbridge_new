import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can submit payments" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      lawyer_email,
      lawyer_name,
      amount,
      transaction_id,
      bank_account_id,
      case_description,
      client_phone,
    } = body

    // Validate required fields
    if (!lawyer_email || !lawyer_name || !amount || !transaction_id || !bank_account_id || !case_description || !client_phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const sql = getDb()

    // Check if transaction ID already exists
    const existingPayment = await sql`
      SELECT id FROM escrow_payments WHERE transaction_id = ${transaction_id} LIMIT 1
    `
    if (existingPayment.length > 0) {
      return NextResponse.json(
        { error: "This transaction ID has already been submitted" },
        { status: 400 }
      )
    }

    // Verify lawyer exists by email
    const lawyers = await sql`
      SELECT id, first_name, last_name, email FROM users
      WHERE email = ${lawyer_email.toLowerCase()} AND role = 'lawyer'
      LIMIT 1
    `
    if (lawyers.length === 0) {
      return NextResponse.json(
        { error: "Lawyer not found with this email address" },
        { status: 404 }
      )
    }

    const lawyer = lawyers[0]

    // Verify bank account exists and is active
    const bankAccounts = await sql`
      SELECT id FROM organization_bank_accounts
      WHERE id = ${bank_account_id} AND is_active = true
      LIMIT 1
    `
    if (bankAccounts.length === 0) {
      return NextResponse.json(
        { error: "Invalid or inactive bank account" },
        { status: 400 }
      )
    }

    // Insert payment record
    const result = await sql`
      INSERT INTO escrow_payments (
        client_id,
        lawyer_id,
        bank_account_id,
        transaction_id,
        amount,
        case_description,
        client_name,
        client_email,
        client_phone,
        lawyer_name,
        lawyer_email,
        status
      ) VALUES (
        ${user.id},
        ${lawyer.id},
        ${bank_account_id},
        ${transaction_id},
        ${amount},
        ${case_description},
        ${user.first_name + ' ' + user.last_name},
        ${user.email},
        ${client_phone},
        ${lawyer_name},
        ${lawyer_email.toLowerCase()},
        'pending_verification'
      )
      RETURNING id, transaction_id, amount, status, created_at
    `

    // Create initial status history entry
    await sql`
      INSERT INTO payment_status_history (
        payment_id,
        old_status,
        new_status,
        changed_by,
        notes
      ) VALUES (
        ${result[0].id},
        NULL,
        'pending_verification',
        ${user.id},
        'Payment submitted by client'
      )
    `

    return NextResponse.json(
      {
        success: true,
        payment: result[0],
        message: "Payment submitted successfully. Awaiting admin verification."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting payment:", error)
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    )
  }
}
