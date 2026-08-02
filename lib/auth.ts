"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  role: string
}

const ADMIN_EMAILS = new Set(["admin@clar1ty.art", "admin@clarity.art"])

function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase()
}

function fallbackRole(email: string): string {
  return ADMIN_EMAILS.has(normalizeEmail(email)) ? "admin" : "user"
}

async function readProfileRole(userId: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.warn("[auth] Profile role unavailable; using safe fallback", error.message)
    return null
  }

  return typeof data?.role === "string" ? data.role : null
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient()
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    return { user: null, error: "Email and password are required" }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: "Login failed" }
    }

    // Authentication must never depend on browser-side profile writes. Profile
    // creation/migration belongs in a server-side trigger or protected admin API.
    const role =
      (await readProfileRole(data.user.id)) ??
      fallbackRole(data.user.email ?? normalizedEmail)

    return {
      user: {
        id: data.user.id,
        email: normalizeEmail(data.user.email ?? normalizedEmail),
        role,
      },
      error: null,
    }
  } catch (error) {
    console.error("[auth] Unexpected login failure", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unable to sign in",
    }
  }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return null

  const email = normalizeEmail(session.user.email)
  const role = (await readProfileRole(session.user.id)) ?? fallbackRole(email)

  return {
    id: session.user.id,
    email,
    role,
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getUser()) !== null
}

function userFromSession(session: { user: { id: string; email?: string } }): User {
  const email = normalizeEmail(session.user.email)
  return {
    id: session.user.id,
    email,
    role: fallbackRole(email),
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const applySession = (session: { user: { id: string; email?: string } } | null) => {
      if (!isMounted) return

      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      const initialUser = userFromSession(session)
      setUser(initialUser)
      setLoading(false)

      readProfileRole(session.user.id).then((role) => {
        if (!isMounted || !role) return
        setUser((current) => (current ? { ...current, role } : current))
      })
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => applySession(session))

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: user !== null,
  }
}
