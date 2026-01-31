"use client"

import React from "react"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Proposal } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Loader2,
  User,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function ProposalsPage() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState("")

  const isClient = user?.role?.toUpperCase() === "CLIENT"

  useEffect(() => {
    fetchProposals()
  }, [isClient])

  const fetchProposals = async () => {
    const endpoint = isClient ? "/api/proposal/job-proposals/" : "/api/proposal/my-proposal/"

    const { data } = await api.get<any>(endpoint)

    if (data) {
      const proposalsArray = Array.isArray(data) ? data : (data.results || [])
      setProposals(proposalsArray)
    }
    setLoading(false)
  }

  const handleAccept = async (proposalId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setError("")
    setActionLoading(proposalId)

    const { error: apiError } = await api.patch(`/api/proposal/proposals/${proposalId}/accept/`, {})

    if (apiError) {
      setError(apiError)
    } else {
      await fetchProposals()
    }
    setActionLoading(null)
  }

  const handleReject = async (proposalId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setError("")
    setActionLoading(proposalId)

    const { error: apiError } = await api.patch(`/api/proposal/proposals/${proposalId}/reject/`, {})

    if (apiError) {
      setError(apiError)
    } else {
      await fetchProposals()
    }
    setActionLoading(null)
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-accent/10 text-accent border-accent/30"
      case "REJECTED":
        return "bg-destructive/10 text-destructive border-destructive/30"
      default:
        return "bg-chart-3/10 text-chart-3 border-chart-3/30"
    }
  }

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          {isClient ? "Received Proposals" : "My Proposals"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isClient ? "Review proposals from freelancers" : "Track your submitted proposals"}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {proposals.length} {proposals.length === 1 ? "proposal" : "proposals"}
      </p>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-secondary p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">No proposals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isClient
                  ? "Proposals from freelancers will appear here"
                  : "Submit proposals on jobs to see them here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="border-border bg-card transition-all hover:border-accent/50 hover:bg-secondary/30"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {proposal.job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {isClient
                            ? `Freelancer: ${proposal.freelancer?.email || 'N/A'}`
                            : `Client: ${proposal.client?.email || proposal.job?.client?.email || 'N/A'}`}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("border", getStatusStyles(proposal.status))}
                    >
                      {proposal.status === "ACCEPTED" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {proposal.status === "REJECTED" && <XCircle className="mr-1 h-3 w-3" />}
                      {proposal.status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                      {proposal.status.toLowerCase()}
                    </Badge>
                  </div>

                  {/* Cover Letter */}
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Cover Letter
                    </h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {proposal.cover_letter}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <DollarSign className="h-4 w-4 text-accent" />
                      <span className="font-semibold">${proposal.proposed_price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{proposal.estimated_days} days</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Submitted{" "}
                        {formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Client Only) */}
                  {isClient && proposal.status === "PENDING" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={(e) => handleAccept(proposal.id, e)}
                        disabled={actionLoading === proposal.id}
                        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {actionLoading === proposal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleReject(proposal.id, e)}
                        disabled={actionLoading === proposal.id}
                        className="gap-2 border-destructive/50 bg-transparent text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
