import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import { generateBackupCodes, hashBackupCode } from "@/lib/backup-codes"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("lawbridge_session")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `LawBridge (${user.email})`,
      issuer: "LawBridge Ethiopia",
      length: 32,
    })

    // Generate QR code as data URL
    const otpauthUrl = `otpauth://totp/LawBridge%20Ethiopia:${encodeURIComponent(user.email)}?secret=${secret.base32}&issuer=LawBridge%20Ethiopia`;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));

    // Store secret and hashed backup codes in database (not enabled yet)
    const sql = getDb();
    await sql`
      UPDATE users
      SET two_factor_secret = ${secret.base32},
          two_factor_backup_codes = ${JSON.stringify(hashedBackupCodes)}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes: backupCodes, // Send plain codes to user (only shown once)
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}
