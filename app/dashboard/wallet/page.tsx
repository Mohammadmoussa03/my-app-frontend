"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Wallet, Transaction, Contract } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  CreditCard,
  Banknote,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [fundingContract, setFundingContract] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Deposit/Withdraw state
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [depositLoading, setDepositLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  const isClient = user?.role?.toUpperCase() === "CLIENT"

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    const { data: walletData } = await api.get<any>("/wallet/wallet/my/")
    const { data: transactionsData } = await api.get<any>("/wallet/wallet/transactions/")

    if (isClient) {
      const { data: contractsData } = await api.get<any>("/contract/client/")
      if (contractsData) {
        const contractsArray = Array.isArray(contractsData) ? contractsData : (contractsData.results || [])
        const pending = contractsArray.filter((c: Contract) => c.status === "PENDING FUNDS")
        setPendingContracts(pending)
      }
    }

    if (walletData) {
      const walletArray = Array.isArray(walletData) ? walletData : (walletData.results || [walletData])
      if (walletArray.length > 0) setWallet(walletArray[0])
    }
    if (transactionsData) {
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : (transactionsData.results || [])
      setTransactions(transactionsArray)
    }
    setLoading(false)
  }

  const handleFundEscrow = async (contractId: number, contractPrice: number) => {
    setError("")
    setSuccess("")
    setFundingContract(contractId)

    // Check if user has enough balance before making the request
    const availableBalance = parseFloat(wallet?.available_balance || "0")
    if (availableBalance < contractPrice) {
      setError(`Insufficient balance. You need $${contractPrice.toFixed(2)} but only have $${availableBalance.toFixed(2)} available. Please add funds to your wallet.`)
      setFundingContract(null)
      return
    }

    const { error: apiError } = await api.post(`/wallet/fund/${contractId}/escrow`, {})

    if (apiError) {
      // Handle specific error messages from backend
      if (apiError.toLowerCase().includes("balance") || apiError.toLowerCase().includes("insufficient") || apiError.toLowerCase().includes("enough")) {
        setError("Insufficient balance. Please add funds to your wallet before funding this escrow.")
      } else {
        setError(apiError)
      }
    } else {
      setSuccess("Escrow funded successfully! Contract is now active.")
      await fetchWalletData()
    }
    setFundingContract(null)
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setError("")
    setDepositLoading(true)

    const { data, error: apiError } = await api.post<{ checkout_url: string }>("/wallet/wallet/deposit/", {
      amount: amount,
    })

    if (apiError) {
      setError(apiError)
      setDepositLoading(false)
    } else if (data?.checkout_url) {
      // Redirect to Stripe Checkout
      window.location.href = data.checkout_url
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const availableBalance = parseFloat(wallet?.available_balance || "0")
    if (amount > availableBalance) {
      setError(`Insufficient balance. You can only withdraw up to $${availableBalance.toFixed(2)}`)
      return
    }

    setError("")
    setWithdrawLoading(true)

    const { data, error: apiError } = await api.post<{ withdrawal_id: number; status: string }>("/wallet/wallet/withdraw/", {
      amount: amount,
    })

    if (apiError) {
      setError(apiError)
    } else if (data) {
      setSuccess(`Withdrawal of $${amount.toFixed(2)} initiated successfully. Status: ${data.status}`)
      setWithdrawAmount("")
      setWithdrawDialogOpen(false)
      await fetchWalletData()
    }
    setWithdrawLoading(false)
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Wallet</h1>
        <p className="mt-1 text-muted-foreground">Manage your funds and transactions</p>
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
          <AlertDescription className="text-foreground">{success}</AlertDescription>
        </Alert>
      )}

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
            <div className="rounded-lg bg-accent/10 p-2">
              <WalletIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${wallet?.available_balance || "0.00"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Ready to use or withdraw</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escrow Balance
            </CardTitle>
            <div className="rounded-lg bg-chart-3/10 p-2">
              <Lock className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${wallet?.escrow_balance || "0.00"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Locked in active contracts</p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit & Withdraw Actions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
          <CardDescription>Add or withdraw funds from your wallet</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          {/* Deposit Dialog */}
          <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" />
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogDescription>
                  Add money to your wallet using Stripe. You will be redirected to a secure checkout page.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="deposit-amount" className="text-sm font-medium text-foreground">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(amount.toString())}
                      className="flex-1 bg-transparent"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDepositDialogOpen(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositAmount}
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {depositLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {depositLoading ? "Redirecting..." : "Continue to Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Withdraw Dialog */}
          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                <Banknote className="h-4 w-4" />
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw money from your wallet. Available balance: ${wallet?.available_balance || "0.00"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="withdraw-amount" className="text-sm font-medium text-foreground">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      max={wallet?.available_balance || "0"}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(wallet?.available_balance || "0")}
                  className="w-full bg-transparent"
                >
                  Withdraw All (${wallet?.available_balance || "0.00"})
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWithdrawDialogOpen(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawAmount}
                  className="gap-2"
                >
                  {withdrawLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  {withdrawLoading ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Pending Contracts (Client Only) */}
      {isClient && pendingContracts.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-accent" />
              Pending Escrow Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{contract.job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Freelancer: {contract.freelancer.email}
                  </p>
                  <p className="mt-1 text-lg font-bold text-accent">${contract.price}</p>
                </div>
                <Button
                  onClick={() => handleFundEscrow(contract.id, parseFloat(contract.price))}
                  disabled={fundingContract === contract.id}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {fundingContract === contract.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Funding...
                    </>
                  ) : (
                    "Fund Escrow"
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-secondary p-4">
                <WalletIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No transactions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        transaction.direction === "CREDIT" ? "bg-accent/10" : "bg-destructive/10"
                      )}
                    >
                      {transaction.direction === "CREDIT" ? (
                        <ArrowDownLeft className="h-5 w-5 text-accent" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize text-foreground">
                        {transaction.type.toLowerCase().replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-lg font-semibold",
                        transaction.direction === "CREDIT" ? "text-accent" : "text-destructive"
                      )}
                    >
                      {transaction.direction === "CREDIT" ? "+" : "-"}${transaction.amount}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mt-1",
                        transaction.status === "SUCCESS" && "bg-accent/10 text-accent",
                        transaction.status === "FAILED" && "bg-destructive/10 text-destructive",
                        transaction.status === "PENDING" && "bg-chart-3/10 text-chart-3"
                      )}
                    >
                      {transaction.status === "SUCCESS" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {transaction.status === "FAILED" && <XCircle className="mr-1 h-3 w-3" />}
                      {transaction.status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
