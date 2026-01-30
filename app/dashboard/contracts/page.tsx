"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Contract } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, File as FileIcon, ArrowRight, Clock, User } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function ContractsPage() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const isClient = user?.role?.toUpperCase() === "CLIENT"

  useEffect(() => {
    console.log("[v0] ContractsPage - user:", user)
    console.log("[v0] ContractsPage - user.role:", user?.role)
    
    if (!user) {
      console.log("[v0] ContractsPage - No user yet, waiting...")
      return
    }

    const fetchContracts = async () => {
      const roleUpper = user.role?.toUpperCase()
      console.log("[v0] ContractsPage - roleUpper:", roleUpper)
      
      const endpoint = roleUpper === "CLIENT"
        ? "/contract/client/"
        : "/contract/freelancer/"
      
      console.log("[v0] ContractsPage - Fetching from endpoint:", endpoint)

      const { data } = await api.get<any>(endpoint)

      if (data) {
        const contractsArray = Array.isArray(data) ? data : (data.results || [])
        console.log("[v0] ContractsPage - Contracts fetched:", contractsArray.length)
        setContracts(contractsArray)
      }
      setLoading(false)
    }

    fetchContracts()
  }, [user])

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-accent/10 text-accent border-accent/30"
      case "COMPLETED":
        return "bg-chart-3/10 text-chart-3 border-chart-3/30"
      case "CANCELLED":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "PENDING FUNDS":
        return "bg-chart-2/10 text-chart-2 border-chart-2/30"
      default:
        return "bg-secondary text-secondary-foreground"
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Contracts</h1>
        <p className="mt-1 text-muted-foreground">
          {isClient ? "Manage your active contracts" : "View your ongoing work"}
        </p>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {contracts.length} {contracts.length === 1 ? "contract" : "contracts"}
      </p>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 rounded-full bg-secondary p-4">
                <FileIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">No contracts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isClient
                  ? "Accept a proposal to create a contract"
                  : "Your accepted proposals will create contracts here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`}>
              <Card className="group cursor-pointer border-border bg-card transition-all hover:border-accent/50 hover:bg-secondary/30">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                          {contract.job.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn("border", getStatusStyles(contract.status))}
                        >
                          {contract.status.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          {isClient
                            ? `Freelancer: ${contract.freelancer.email}`
                            : `Client: ${contract.client.email}`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span className="font-semibold">${contract.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {new Date(contract.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Started{" "}
                            {formatDistanceToNow(new Date(contract.started_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {contract.status === "PENDING FUNDS" && isClient && (
                        <Link href="/dashboard/wallet" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Fund Escrow
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="shrink-0 gap-2 text-muted-foreground transition-colors group-hover:text-accent"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
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
