import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { getDb } from "./db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lawbridge-ethiopia-secret-key-change-in-production"
)

const SESSION_COOKIE = "lawbridge_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionUser {
  id: string
  email: string
  role: "client" | "lawyer" | "student"
  first_name: string
  last_name: string
}

// --- Password utilities ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// --- JWT utilities ---

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return (payload as { user: SessionUser }).user
  } catch {
    return null
  }
}

// --- Session management ---

export async function createSession(user: SessionUser): Promise<void> {
  const token = await createToken(user)
  const sql = getDb()

  // Store session in database
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
  `

  // Set HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const user = await verifyToken(token)
  if (!user) return null

  // Verify session exists in database and is not expired
  const sql = getDb()
  const sessions = await sql`
    SELECT id FROM sessions
    WHERE token = ${token} AND expires_at > NOW()
    LIMIT 1
  `

  if (sessions.length === 0) {
    // Session expired or revoked - clear cookie
    cookieStore.delete(SESSION_COOKIE)
    return null
  }

  return user
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    const sql = getDb()
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }

  cookieStore.delete(SESSION_COOKIE)
}

// --- User queries ---

export async function getUserByEmail(email: string) {
  const sql = getDb()
  const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
  return users[0] || null
}

export async function getUserById(id: string) {
  const sql = getDb()
  const users = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return users[0] || null
}
