import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lawbridge-ethiopia-secret-key-change-in-production"
)

const protectedRoutes = ["/dashboard", "/assistant"]
const authRoutes = ["/auth/login", "/auth/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("lawbridge_session")?.value

  let user = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      user = (payload as { user: { id: string; role: string } }).user
    } catch {
      // Invalid token - will be treated as unauthenticated
    }
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const dashboardUrl = new URL(
      user.role === "lawyer"
        ? "/dashboard/lawyer"
        : user.role === "student"
          ? "/assistant"
          : "/dashboard/client",
      request.url
    )
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/assistant/:path*", "/auth/:path*"],
}
