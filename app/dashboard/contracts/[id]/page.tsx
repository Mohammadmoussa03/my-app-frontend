'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Contract, Deliverable } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Upload,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function ContractDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const [contract, setContract] = useState<Contract | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Deliverable form
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const isClient = user?.role?.toUpperCase() === 'CLIENT'
  const isFreelancer = user?.role?.toUpperCase() === 'FREELANCER'

  useEffect(() => {
    fetchContractDetails()
  }, [params.id])

  const fetchContractDetails = async () => {
    const { data: contractData } = await api.get<Contract>(
      `/api/contract/${params.id}/`
    )
    const { data: deliverablesData } = await api.get<any>(
      `/contracts/${params.id}/deliverables/list/`
    )

    if (contractData) setContract(contractData)
    if (deliverablesData) {
      const deliverablesArray = Array.isArray(deliverablesData) ? deliverablesData : (deliverablesData.results || [])
      setDeliverables(deliverablesArray)
    }
    setLoading(false)
  }

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const formData = new FormData()
    formData.append('message', message)
    if (file) {
      formData.append('file', file)
    }

    const { error: apiError } = await api.uploadFile(
      `/contracts/${params.id}/deliverables/`,
      formData,
      'POST'
    )

    if (apiError) {
      setError(apiError)
    } else {
      setSuccess('Deliverable submitted successfully!')
      setMessage('')
      setFile(null)
      await fetchContractDetails()
    }
    setSubmitting(false)
  }

  const handleApprove = async (deliverableId: number) => {
    setError('')
    const { error: apiError } = await api.patch(`/deliverables/${deliverableId}/approve/`, {})

    if (apiError) {
      setError(apiError)
    } else {
      setSuccess('Deliverable approved successfully!')
      await fetchContractDetails()
    }
  }

  const handleReject = async (deliverableId: number) => {
    setError('')
    const { error: apiError } = await api.patch(`/deliverables/${deliverableId}/reject/`, {})

    if (apiError) {
      setError(apiError)
    } else {
      setSuccess('Deliverable rejected.')
      await fetchContractDetails()
    }
  }

  const getDeliverableStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/contracts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Contracts
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>Contract not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/contracts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Button>
      </Link>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contract Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{contract.job.title}</CardTitle>
              <CardDescription>
                {isClient
                  ? `Freelancer: ${contract.freelancer.email}`
                  : `Client: ${contract.client.email}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Price</p>
                    <p className="font-semibold">${contract.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">
                      {new Date(contract.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">{contract.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
              <CardDescription>
                Work submissions and versions for this contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No deliverables submitted yet
                </p>
              ) : (
                deliverables.map((deliverable) => (
                  <Card key={deliverable.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base">
                            Version {deliverable.version}
                          </CardTitle>
                          <CardDescription>
                            Submitted by {deliverable.submitted_by.email}
                          </CardDescription>
                        </div>
                        {getDeliverableStatusBadge(deliverable.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Message</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {deliverable.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <a
                          href={deliverable.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(deliverable.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {isClient && deliverable.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(deliverable.id)}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(deliverable.id)}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Deliverable (Freelancers Only) */}
        <div>
          {isFreelancer && contract.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Work</CardTitle>
                <CardDescription>Upload your deliverable for review</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Describe what you've completed..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="file" className="text-sm font-medium">
                      File
                    </label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    <Upload className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Submit Deliverable'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isFreelancer && contract.status === 'PENDING FUNDS' && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Submissions Locked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Work submissions are currently unavailable for this contract.
                </p>
                <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">Why is this locked?</p>
                  <p className="text-muted-foreground">
                    The client has not yet funded the escrow for this contract. Once the payment is secured in escrow, you will be able to begin submitting your work.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  This ensures that payment is guaranteed before work begins, protecting both parties in the transaction.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
