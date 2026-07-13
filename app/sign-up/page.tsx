"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { login } from "@/lib/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!acceptTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.")
      return
    }

    setLoading(true)
    const signupResponse = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password: password.trim(), name: name.trim() }),
    })

    const signupData = await signupResponse.json()
    if (!signupResponse.ok) {
      setError(signupData.error || "Failed to create account")
      setLoading(false)
      return
    }

    const { user, error: loginError } = await login(email.trim(), password.trim())
    if (loginError || !user) {
      setError("Account created. Please sign in.")
      setLoading(false)
      return
    }

    router.push("/app/studio?welcome=1")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-[#efe8dc]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <Link href="/" className="inline-flex">
            <span className="text-xs uppercase tracking-[0.4em] text-[#c9953d]">clar1ty</span>
          </Link>
          <h1 className="text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Create your account</h1>
          <p className="max-w-xl text-sm leading-7 text-[#d4c7b6]">Start enhancing images with 10 free credits.</p>

          <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-3xl bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <label className="block space-y-2">
              <span className="text-sm text-[#e7dac7]">Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Your name"
                className="clarity-input rounded-none"
                autoComplete="name"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-[#e7dac7]">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
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
                placeholder="Create a password"
                className="clarity-input rounded-none"
                autoComplete="new-password"
              />
            </label>
            <label className="flex items-start gap-3 text-sm leading-6 text-[#bca98d]">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                className="mt-1 h-4 w-4 border-[#8b7d6a] bg-transparent"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#d7a957] transition hover:text-white">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#d7a957] transition hover:text-white">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {error ? <p className="text-sm text-[#ef8f7f]">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-none bg-[#c9953d] text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button
              type="button"
              className="h-12 w-full rounded-none border border-[#6f5d49] bg-[#17120f] text-sm font-semibold uppercase tracking-[0.12em] text-[#f0e2cf]"
              disabled
            >
              Continue with Google
            </button>
            <p className="text-center text-sm text-[#bca98d]">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#d7a957] transition hover:text-white">
                Sign in
              </Link>
            </p>
          </form>
        </section>

        <section className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-[#17120f]">
          <Image
            src="/images/landing/comparisons/heritage-after.jpg"
            alt="Clar1ty restored heritage image"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-[#17120f]/80" />
          <div className="absolute inset-0 flex items-end p-8">
            <div className="max-w-md">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">10 free credits</p>
              <h2 className="mt-4 text-3xl font-light leading-tight text-white">Upload your first image to begin.</h2>
              <p className="mt-4 text-sm leading-7 text-[#d7ccba]">Secure processing, simple pricing and a workflow designed for portraits, creators and heritage restoration.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
