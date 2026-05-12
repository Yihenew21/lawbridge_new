"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export interface AuthUser {
  id: string
  email: string
  role: "client" | "lawyer" | "student"
  first_name: string
  last_name: string
  avatar_url?: string | null
  email_verified?: boolean
  account_status?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return { user: null }
  return res.json()
}

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ user: AuthUser | null }>(
    "/api/auth/me",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  )

  const user = data?.user ?? null
  const isAuthenticated = !!user

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Login failed")

      // Check if 2FA is required
      if (json.requires2FA) {
        return {
          requires2FA: true,
          userId: json.userId,
          email: json.email,
        }
      }

      await mutate({ user: json.user }, false)
      return json.user as AuthUser
    },
    [mutate]
  )

  const register = useCallback(
    async (data: {
      email: string
      password: string
      first_name: string
      last_name: string
      role: string
      phone?: string
      specialization?: string
      license_number?: string
      bio?: string
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Registration failed")
      await mutate({ user: json.user }, false)
      return json.user as AuthUser
    },
    [mutate]
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate({ user: null }, false)
    router.push("/")
  }, [mutate, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    mutate,
  }
}
