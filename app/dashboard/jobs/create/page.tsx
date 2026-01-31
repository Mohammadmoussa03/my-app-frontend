"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Category } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Briefcase, DollarSign, Calendar, Tag, Plus } from "lucide-react"
import Link from "next/link"

export default function CreateJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("MID")
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")

  // New category state
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)

  const fetchCategories = async () => {
    const { data } = await api.get<any>("/api/jobs/categories/")
    if (data) {
      const categoriesArray = Array.isArray(data) ? data : (data.results || [])
      setCategories(categoriesArray)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (user?.role?.toUpperCase() !== "CLIENT") {
      router.push("/dashboard")
    }
  }, [user, router])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    
    setCreatingCategory(true)
    setError("")

    const { data, error: apiError } = await api.post<any>("/api/jobs/categories/create/", {
      name: newCategoryName.trim(),
      slug: generateSlug(newCategoryName.trim()),
    })

    if (apiError) {
      setError(apiError)
    } else if (data) {
      await fetchCategories()
      setCategoryId(data.id?.toString() || "")
      setNewCategoryName("")
      setShowNewCategory(false)
    }
    setCreatingCategory(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: apiError } = await api.post("/api/jobs/jobs/create/", {
      title,
      description,
      category: Number(categoryId),
      experience_level: experienceLevel,
      budget,
      deadline,
    })

    if (apiError) {
      setError(apiError)
      setLoading(false)
    } else {
      router.push("/dashboard/jobs")
    }
  }

  if (user?.role?.toUpperCase() !== "CLIENT") {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/jobs">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Post a New Job
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create a job posting to find talented freelancers
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Briefcase className="h-5 w-5 text-accent" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Job Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Build a React Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe your project, requirements, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                required
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Include all relevant details about your project
              </p>
            </div>

            {/* Category & Experience Level */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Category
                </label>
                
                {!showNewCategory ? (
                  <div className="space-y-2">
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                      <SelectTrigger
                        id="category"
                        className="border-border bg-secondary/50 text-foreground"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewCategory(true)}
                      className="h-auto p-0 text-xs text-accent hover:text-accent/80"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Create new category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {creatingCategory ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowNewCategory(false)
                        setNewCategoryName("")
                      }}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel, select existing
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="experienceLevel" className="text-sm font-medium text-foreground">
                  Experience Level
                </label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger
                    id="experienceLevel"
                    className="border-border bg-secondary/50 text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Mid-Level</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget & Deadline */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="budget"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Budget (USD)
                </label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deadline"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Deadline
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="border-border bg-secondary/50 text-foreground"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
              <Link href="/dashboard/jobs">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border bg-transparent text-foreground hover:bg-secondary"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
