"use client"

import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  role: string
}

export async function login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient()

  console.log("[v0] Attempting Supabase login for:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[v0] Supabase auth error:", error)
    return { user: null, error: error.message }
  }

  if (data.user) {
    console.log("[v0] Supabase auth successful, fetching user data")

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle()

    if (!userData && !userError) {
      console.log("[v0] User not found by ID, checking by email...")
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", data.user.email!)
        .maybeSingle()

      if (existingUser) {
        console.log("[v0] Found user with different ID, migrating data...")

        const { data: existingCredits } = await supabase
          .from("user_credits")
          .select("credits")
          .eq("user_id", existingUser.id)
          .maybeSingle()

        const creditsToTransfer = existingCredits?.credits || 999999

        await supabase.from("user_credits").delete().eq("user_id", existingUser.id)

        await supabase.from("users").delete().eq("id", existingUser.id)

        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          role: existingUser.role,
        })

        await supabase.from("user_credits").insert({
          user_id: data.user.id,
          credits: creditsToTransfer,
        })

        console.log("[v0] Successfully migrated user data to new ID")

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          role: existingUser.role,
        }

        console.log("[v0] Login complete, user:", user)
        return { user, error: null }
      } else {
        console.log("[v0] User not found, creating new record...")
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          role: email === "admin@clarity.art" ? "admin" : "user",
        })

        if (insertError) {
          console.error("[v0] Error creating user record:", insertError)
        }
      }
    } else if (userError) {
      console.error("[v0] Error fetching user data:", userError)
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      role: userData?.role || (email === "admin@clarity.art" ? "admin" : "user"),
    }

    console.log("[v0] Login complete, user:", user)
    return { user, error: null }
  }

  return { user: null, error: "Login failed" }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  return {
    id: user.id,
    email: user.email!,
    role: userData?.role || "user",
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return user !== null
}
