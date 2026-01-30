"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TokenResponse {
  access: string
  refresh: string
}

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const errorParam = searchParams.get("error")

      if (errorParam) {
        setError("Google authentication was cancelled or failed. Please try again.")
        setLoading(false)
        return
      }

      if (!code) {
        setError("No authorization code received from Google.")
        setLoading(false)
        return
      }

      // Get stored action and role
      const action = sessionStorage.getItem("google_auth_action") || "login"
      const role = sessionStorage.getItem("google_auth_role") || "FREELANCER"

      // Clear stored data
      sessionStorage.removeItem("google_auth_action")
      sessionStorage.removeItem("google_auth_role")

      // Send the code to the backend
      const { data, error: apiError } = await api.post<TokenResponse>("/auth/google/", {
        code,
        role,
      })

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      if (data) {
        // Store tokens
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)

        // Fetch user profile
        const { data: profileData } = await api.get<any>("/account/profile/me/")

        if (profileData) {
          const userData = {
            id: profileData.user?.id || profileData.id,
            email: profileData.user?.email || "",
            role: profileData.user?.role || role,
            profile: {
              id: profileData.id,
              full_name: profileData.full_name || "",
              bio: profileData.bio || "",
              country: profileData.country || "",
              avatar: profileData.avatar || null,
              skills: profileData.skills || "",
              company_name: profileData.company_name || "",
            },
          }

          localStorage.setItem("user", JSON.stringify(userData))
        }

        // Redirect to dashboard
        router.push("/dashboard")
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#22c55e]" />
          <h2 className="mt-4 text-xl font-semibold text-[#0f172a]">
            Completing sign in...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we verify your account.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0f172a]">
              Authentication Failed
            </h2>
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                Try again
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto bg-[#0f172a] text-white hover:bg-[#1e293b]">
                Go to homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
