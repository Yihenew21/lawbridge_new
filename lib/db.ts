import { neon } from "@neondatabase/serverless"

let cachedDb: ReturnType<typeof neon> | null = null

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // Reuse connection to avoid creating new connections on every request
  if (!cachedDb) {
    cachedDb = neon(process.env.DATABASE_URL, {
      fetchOptions: {
        cache: 'no-store',
      },
    })
  }

  return cachedDb
}
