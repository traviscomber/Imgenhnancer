"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { login } from "@/lib/auth"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    const { user, error: loginError } = await login(email.trim(), password.trim())
    if (loginError || !user) {
      setError(loginError || "Unable to sign in")
      setLoading(false)
      return
    }

    router.push("/enhance")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-[#efe8dc]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <Link href="/" className="inline-flex">
            <span className="text-xs uppercase tracking-[0.4em] text-[#c9953d]">clar1ty</span>
          </Link>
          <h1 className="text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Welcome back</h1>
          <p className="max-w-xl text-sm leading-7 text-[#d4c7b6]">Sign in to continue restoring your images.</p>

          <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-3xl bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <label className="block space-y-2">
              <span className="text-sm text-[#e7dac7]">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="admin@clarity.art"
                className="clarity-input rounded-none"
                autoComplete="email"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[#e7dac7]">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter password"
                className="clarity-input rounded-none"
                autoComplete="current-password"
              />
            </label>
            <div className="flex items-center justify-between gap-3 text-sm text-[#bca98d]">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 border-[#8b7d6a] bg-transparent" />
                Remember me
              </label>
              <Link href="/support" className="transition hover:text-[#d7a957]">
                Forgot password?
              </Link>
            </div>
            {error ? <p className="text-sm text-[#ef8f7f]">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-none bg-[#c9953d] text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              className="h-12 w-full rounded-none border border-[#6f5d49] bg-[#17120f] text-sm font-semibold uppercase tracking-[0.12em] text-[#f0e2cf]"
              disabled
            >
              Continue with Google
            </button>
            <p className="text-center text-sm text-[#bca98d]">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-[#d7a957] transition hover:text-white">
                Sign up
              </Link>
            </p>
          </form>
        </section>

        <section className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-[#17120f]">
          <Image
            src="/images/landing/comparisons/hero-after-new.png"
            alt="Clar1ty enhanced portrait"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-[#17120f]/80" />
          <div className="absolute inset-0 flex items-end p-8">
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Secure, private, simple</p>
              <h2 className="mt-4 text-3xl font-light leading-tight text-white">Your images stay yours.</h2>
              <p className="mt-4 text-sm leading-7 text-[#d7ccba]">All images are encrypted and processed safely. No unnecessary storage. We save nothing you do not ask us to.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
