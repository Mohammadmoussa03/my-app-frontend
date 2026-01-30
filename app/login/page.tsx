"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, ArrowRight, Loader2, Shield, Star } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login({ email, password })

    if (result.error) {
      setError(result.error)
    }

    setLoading(false)
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
            <div className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-4 py-2 text-sm text-[#22c55e]">
              <Shield className="h-4 w-4" />
              Escrow Protected
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Welcome back to the platform that pays
            </h2>
          </div>

          <blockquote className="space-y-4 border-l-2 border-[#22c55e] pl-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              "FreelanceHub transformed how I find clients. The escrow system gives me peace of mind on every project."
            </p>
            <footer className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-700" />
              <div>
                <div className="font-medium text-white">Sarah Chen</div>
                <div className="text-sm text-gray-400">Full-Stack Developer</div>
              </div>
            </footer>
          </blockquote>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-[#f59e0b] text-[#f59e0b]" />
            ))}
            <span className="ml-2 text-sm text-gray-400">4.9/5 from 2,000+ reviews</span>
          </div>
        </div>

        <div className="relative text-sm text-gray-400">
          Trusted by 10,000+ freelancers worldwide
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
            <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Welcome back</h1>
            <p className="mt-2 text-gray-600">
              Enter your credentials to access your account
            </p>
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-gray-200 bg-white text-[#0f172a] placeholder:text-gray-400 focus-visible:ring-[#22c55e] focus-visible:border-[#22c55e]"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#22c55e] hover:text-[#16a34a]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
