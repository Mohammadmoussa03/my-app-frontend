"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Profile } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Calendar, Upload, Loader2, CheckCircle2, MapPin, Building2 } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [country, setCountry] = useState("")
  const [skills, setSkills] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await api.get<Profile>("/api/account/profile/me/")

    if (data) {
      setProfile(data)
      setFullName(data.full_name || "")
      setBio(data.bio || "")
      setCountry(data.country || "")
      setSkills(data.skills || "")
      setCompanyName(data.company_name || "")
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setSaving(true)

    const formData = new FormData()
    formData.append("full_name", fullName)
    formData.append("bio", bio)
    formData.append("country", country)
    formData.append("skills", skills)
    formData.append("company_name", companyName)

    if (avatarFile) {
      formData.append("avatar", avatarFile)
    }

    const { error: apiError } = await api.uploadFile("/api/account/profile/me/", formData)

    if (apiError) {
      setError(apiError)
    } else {
      setSuccess(true)
      await fetchProfile()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U"

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account information</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-accent/50 bg-accent/10">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <AlertDescription className="text-foreground">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage
                  src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar || ""}
                />
                <AvatarFallback className="bg-accent/10 text-xl text-accent">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <label htmlFor="avatar" className="text-sm font-medium text-foreground">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="avatar"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Upload className="h-4 w-4" />
                    Choose file
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {avatarFile ? avatarFile.name : "No file selected"}
                  </span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Email & Role (Read-only) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="border-border bg-secondary/30 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Input
                  value={user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : ""}
                  disabled
                  className="border-border bg-secondary/30 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Your account type</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-foreground">
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your expertise..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Country & Company */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="country" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Country
                </label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Company Name
                </label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label htmlFor="skills" className="text-sm font-medium text-foreground">
                Skills
              </label>
              <Textarea
                id="skills"
                placeholder="JavaScript, React, Node.js, Python, TypeScript..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={3}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of your skills
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={saving}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-semibold text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
