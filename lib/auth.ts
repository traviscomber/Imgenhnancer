"use client"

// Simple authentication utilities
export interface User {
  username: string
  role: "admin"
}

const ADMIN_PASSWORD = "N3uralia.2025"

export function login(password: string): User | null {
  if (password === ADMIN_PASSWORD) {
    const user: User = {
      username: "admin",
      role: "admin",
    }
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user))
      localStorage.setItem("auth_timestamp", Date.now().toString())
    }
    return user
  }
  return null
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_timestamp")
  }
}

export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("auth_user")
    const timestamp = localStorage.getItem("auth_timestamp")

    if (userStr && timestamp) {
      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - Number.parseInt(timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (sessionAge < maxAge) {
        return JSON.parse(userStr)
      } else {
        // Session expired
        logout()
      }
    }
  }
  return null
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}
