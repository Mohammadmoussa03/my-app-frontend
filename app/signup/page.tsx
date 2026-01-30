"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserRole } from "@/lib/types"
import { Briefcase, ArrowRight, Loader2, User, Building2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const { signup } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("FREELANCER")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signup({ email, password, role })

    if (result.error) {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    // Implement Google signup logic here
    setGoogleLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0f172a] p-12 lg:flex">
        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FreelanceHub</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Join the community of top freelancers and clients
            </h2>
            <p className="text-lg text-gray-400">
              Start finding projects or hiring talent in minutes.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Access to verified clients worldwide",
              "Secure escrow payment protection",
              "No hidden fees on transactions",
              "24/7 customer support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e]/20">
                  <Check className="h-4 w-4 text-[#22c55e]" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-gray-400">
          Trusted by 10,000+ professionals worldwide
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">FreelanceHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Create an account</h1>
            <p className="mt-2 text-gray-600">Enter your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#0f172a]">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-200 bg-white text-[#0f172a] placeholder:text-gray-400 focus-visible:ring-[#22c55e] focus-visible:border-[#22c55e]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0f172a]">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-200 bg-white text-[#0f172a] placeholder:text-gray-400 focus-visible:ring-[#22c55e] focus-visible:border-[#22c55e]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-[#0f172a]">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("FREELANCER")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "FREELANCER"
                      ? "border-[#22c55e] bg-[#22c55e]/5 text-[#0f172a]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <User className={cn("h-6 w-6", role === "FREELANCER" && "text-[#22c55e]")} />
                  <span className="text-sm font-medium">Freelancer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "CLIENT"
                      ? "border-[#22c55e] bg-[#22c55e]/5 text-[#0f172a]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Building2 className={cn("h-6 w-6", role === "CLIENT" && "text-[#22c55e]")} />
                  <span className="text-sm font-medium">Client</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#22c55e] hover:text-[#16a34a]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
