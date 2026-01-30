"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  FileText,
  File,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface WalletData {
  available_balance: string
  escrow_balance: string
}

interface Activity {
  id: number
  type: 'proposal' | 'contract' | 'job'
  title: string
  description: string
  date: string
  status?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    jobs: 0,
    proposals: 0,
    contracts: 0,
  })
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      try {
        if (user?.role?.toUpperCase() === "CLIENT") {
          const { data: jobs } = await api.get<any>("/jobs/jobs/")
          const jobsArray = Array.isArray(jobs) ? jobs : (jobs?.results || [])
          setStats((prev) => ({ ...prev, jobs: jobsArray.length }))
        }

        const { data: proposals } = await api.get<any>(
          user?.role?.toUpperCase() === "FREELANCER"
            ? "/proposal/my-proposal/"
            : "/proposal/job-proposals/"
        )
        const proposalsArray = Array.isArray(proposals) ? proposals : (proposals?.results || [])
        setStats((prev) => ({ ...prev, proposals: proposalsArray.length }))

        const { data: contracts } = await api.get<any>(
          user?.role?.toUpperCase() === "CLIENT"
            ? "/contract/client/"
            : "/contract/freelancer/"
        )
        const contractsArray = Array.isArray(contracts) ? contracts : (contracts?.results || [])
        setStats((prev) => ({ ...prev, contracts: contractsArray.length }))

        // Fetch wallet data
        const { data: walletData } = await api.get<any>("/wallet/wallet/my/")
        if (walletData) {
          const walletArray = Array.isArray(walletData) ? walletData : (walletData.results || [walletData])
          if (walletArray.length > 0) {
            setWallet(walletArray[0])
          }
        }

        // Build recent activity from proposals and contracts
        const activities: Activity[] = []
        
        if (proposalsArray.length > 0) {
          proposalsArray.slice(0, 3).forEach((p: any) => {
            activities.push({
              id: p.id,
              type: 'proposal',
              title: p.job?.title || 'Proposal',
              description: user?.role?.toUpperCase() === 'FREELANCER' 
                ? `You submitted a proposal for $${p.proposed_price || 0}`
                : `New proposal received - $${p.proposed_price || 0}`,
              date: p.created_at,
              status: p.status,
            })
          })
        }

        if (contractsArray.length > 0) {
          contractsArray.slice(0, 3).forEach((c: any) => {
            activities.push({
              id: c.id,
              type: 'contract',
              title: c.job?.title || c.title || 'Contract',
              description: `Contract ${c.status?.toLowerCase() || 'created'} - $${c.price || 0}`,
              date: c.created_at,
              status: c.status,
            })
          })
        }

        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentActivity(activities.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const isClient = user?.role?.toUpperCase() === "CLIENT"

  const statCards = [
    ...(isClient
      ? [
          {
            title: "Active Jobs",
            value: stats.jobs,
            icon: Briefcase,
            description: "Jobs posted",
            href: "/dashboard/jobs",
            color: "text-[#22c55e]",
            bgColor: "bg-[#22c55e]/10",
          },
        ]
      : []),
    {
      title: isClient ? "Received Proposals" : "Sent Proposals",
      value: stats.proposals,
      icon: FileText,
      description: "Total proposals",
      href: "/dashboard/proposals",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Contracts",
      value: stats.contracts,
      icon: File,
      description: "Ongoing work",
      href: "/dashboard/contracts",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  const quickActions = isClient
    ? [
        {
          title: "Post a New Job",
          description: "Create a job listing to find talented freelancers",
          icon: Plus,
          href: "/dashboard/jobs/create",
          primary: true,
        },
        {
          title: "Review Proposals",
          description: "Check proposals from interested freelancers",
          icon: FileText,
          href: "/dashboard/proposals",
        },
        {
          title: "Manage Contracts",
          description: "View and manage your active contracts",
          icon: File,
          href: "/dashboard/contracts",
        },
      ]
    : [
        {
          title: "Browse Jobs",
          description: "Find new opportunities that match your skills",
          icon: Briefcase,
          href: "/dashboard/jobs",
          primary: true,
        },
        {
          title: "View My Proposals",
          description: "Track the status of your submitted proposals",
          icon: FileText,
          href: "/dashboard/proposals",
        },
        {
          title: "Active Contracts",
          description: "Manage your ongoing projects and deliverables",
          icon: File,
          href: "/dashboard/contracts",
        },
      ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] lg:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s what&apos;s happening with your {isClient ? "jobs" : "freelance work"} today.
          </p>
        </div>
        {isClient && (
          <Link href="/dashboard/jobs/create">
            <Button className="gap-2 bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-sm">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={cn("rounded-xl p-2.5", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-gray-100" />
                ) : (
                  <>
                    <div className="text-3xl font-bold text-[#0f172a]">{stat.value}</div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      {stat.description}
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#0f172a]">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card
                className={cn(
                  "group h-full cursor-pointer border-gray-200 transition-all hover:shadow-md",
                  action.primary ? "bg-[#22c55e]/5 hover:border-[#22c55e]/30" : "bg-white hover:border-gray-300"
                )}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div
                    className={cn(
                      "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                      action.primary ? "bg-[#22c55e] text-white" : "bg-gray-100 text-[#0f172a]"
                    )}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 font-semibold text-[#0f172a]">{action.title}</h3>
                  <p className="flex-1 text-sm text-gray-500">{action.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#22c55e] opacity-0 transition-opacity group-hover:opacity-100">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0f172a]">
              <TrendingUp className="h-5 w-5 text-[#22c55e]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <div className={cn(
                      "mt-0.5 rounded-xl p-2.5",
                      activity.type === 'proposal' ? "bg-blue-50" : "bg-amber-50"
                    )}>
                      {activity.type === 'proposal' ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <File className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[#0f172a] text-sm">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          activity.status === 'PENDING' && "bg-amber-50 text-amber-700",
                          activity.status === 'ACCEPTED' && "bg-green-50 text-[#22c55e]",
                          activity.status === 'REJECTED' && "bg-red-50 text-red-600",
                          activity.status === 'ACTIVE' && "bg-green-50 text-[#22c55e]",
                          activity.status === 'PENDING FUNDS' && "bg-amber-50 text-amber-700",
                          activity.status === 'COMPLETED' && "bg-blue-50 text-blue-600",
                          !activity.status && "bg-gray-100 text-gray-600"
                        )}>
                          {activity.status || 'New'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="mt-1 text-xs text-gray-400">
                  Your recent actions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0f172a]">
              <DollarSign className="h-5 w-5 text-[#22c55e]" />
              {isClient ? "Balance Overview" : "Earnings Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wallet ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#22c55e]/10 to-[#22c55e]/5 p-4">
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold text-[#0f172a]">
                      ${parseFloat(wallet.available_balance || "0").toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#22c55e]/20 p-3">
                    <DollarSign className="h-6 w-6 text-[#22c55e]" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {isClient ? "In Escrow" : "Pending Release"}
                    </p>
                    <p className="text-xl font-semibold text-[#0f172a]">
                      ${parseFloat(wallet.escrow_balance || "0").toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-50 p-3">
                    <Wallet className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <Link href="/dashboard/wallet">
                  <Button variant="outline" className="w-full gap-2 border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50 hover:border-gray-300">
                    View Wallet Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wallet className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No wallet data yet</p>
                <Link href="/dashboard/wallet" className="mt-2">
                  <Button variant="link" className="h-auto p-0 text-xs text-[#22c55e]">
                    View wallet
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
