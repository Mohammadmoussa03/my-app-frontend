'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Job } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Briefcase, Calendar, DollarSign, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Proposal form
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await api.get<any>(`/jobs/jobs/${params.id}/`)

      if (error) {
        setError(error)
      } else if (data) {
        // Handle paginated response (results array) or direct job object
        const jobData = data.results ? data.results[0] : data
        if (jobData) {
          setJob(jobData)
        } else {
          setError('Job not found')
        }
      }
      setLoading(false)
    }

    fetchJob()
  }, [params.id])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await api.post('/proposal/create/', {
      job: job?.id,
      cover_letter: coverLetter,
      proposed_price: proposedPrice,
      estimated_days: Number(estimatedDays),
    })

    if (error) {
      setError(error)
      setSubmitting(false)
    } else {
      setSuccess(true)
      setCoverLetter('')
      setProposedPrice('')
      setEstimatedDays('')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Job not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isFreelancer = user?.role?.toUpperCase() === 'FREELANCER'

  return (
    <div className="space-y-6">
      <Link href="/dashboard/jobs">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {typeof job.category === 'object' ? job.category?.name : job.category || 'Uncategorized'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {job.experience_level?.toLowerCase() || 'any'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold">${job.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience Level</p>
                    <p className="font-semibold capitalize">{job.experience_level?.toLowerCase() || 'Any'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-semibold">
                      {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Form (Freelancers Only) */}
        <div>
          {isFreelancer && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Proposal</CardTitle>
                <CardDescription>Send your proposal to the client</CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <Alert>
                    <AlertDescription>
                      Proposal submitted successfully! The client will review your proposal.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmitProposal} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="coverLetter" className="text-sm font-medium">
                        Cover Letter
                      </label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Explain why you're the best fit for this project..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="proposedPrice" className="text-sm font-medium">
                        Proposed Price ($)
                      </label>
                      <Input
                        id="proposedPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="estimatedDays" className="text-sm font-medium">
                        Estimated Days
                      </label>
                      <Input
                        id="estimatedDays"
                        type="number"
                        placeholder="0"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
