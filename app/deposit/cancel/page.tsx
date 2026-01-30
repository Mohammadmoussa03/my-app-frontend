"use client"

import Link from "next/link"
import { XCircle, ArrowRight, Wallet, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DepositCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Cancelled</CardTitle>
          <CardDescription>
            Your deposit was cancelled. No funds have been charged to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              If you experienced any issues during checkout, please try again or contact support.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/wallet">
              <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <ArrowRight className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
