"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Job, Category } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Briefcase, Calendar, DollarSign, Search, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      const [jobsRes, categoriesRes] = await Promise.all([
        api.get<any>("/jobs/jobs/"),
        api.get<any>("/jobs/categories/"),
      ])

      // Handle paginated response (results array) or direct array
      if (jobsRes.data) {
        const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data.results || [])
        setJobs(jobsData)
      }
      if (categoriesRes.data) {
        const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data.results || [])
        setCategories(categoriesData)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Category is returned as object with name from backend
    const jobCategoryName = typeof job.category === 'object' ? job.category?.name : job.category
    const matchesCategory = selectedCategory === "all" || jobCategoryName?.toLowerCase() === selectedCategory.toLowerCase()
    
    const matchesLevel = selectedLevel === "all" || job.experience_level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Browse Jobs</h1>
        <p className="mt-1 text-muted-foreground">Find your next project opportunity</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-border bg-secondary/50 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 border-border bg-secondary/50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="h-10 border-border bg-secondary/50">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="JUNIOR">Junior</SelectItem>
              <SelectItem value="MID">Mid</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
      </p>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-secondary p-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">No jobs found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
              <Card className="group cursor-pointer border-border bg-card transition-all hover:border-accent/50 hover:bg-secondary/30">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                          {job.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-secondary text-secondary-foreground"
                        >
                          {typeof job.category === 'object' ? job.category?.name : job.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-border",
                            job.experience_level === "SENIOR" && "border-accent/50 text-accent",
                            job.experience_level === "MID" && "border-chart-2/50 text-chart-2",
                            job.experience_level === "JUNIOR" && "border-chart-3/50 text-chart-3"
                          )}
                        >
                          {job.experience_level.toLowerCase()}
                        </Badge>
                      </div>

                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span className="font-semibold">${job.budget}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="shrink-0 gap-2 text-muted-foreground transition-colors group-hover:text-accent"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
