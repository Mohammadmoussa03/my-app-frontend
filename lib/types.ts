export type UserRole = 'CLIENT' | 'FREELANCER'

export interface UserProfile {
  id: number
  full_name: string
  bio: string
  country: string
  avatar: string | null
  skills: string
  company_name: string
}

export interface User {
  id: number
  email: string
  role: UserRole
  is_active?: boolean
  date_joined?: string
  profile?: UserProfile
}

export interface Profile {
  id: number
  user: User
  full_name: string
  bio: string
  country: string
  avatar: string | null
  skills: string
  company_name: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  created_at: string
}

export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR'
export type JobStatus = 'OPEN' | 'CLOSED'

export interface Job {
  id: number
  client: User
  title: string
  description: string
  category: Category
  experience_level: ExperienceLevel
  budget: string
  deadline: string
  status: JobStatus
  created_at: string
  updated_at: string
  proposals_count?: number
}

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface Proposal {
  id: number
  job: Job
  freelancer: User
  client: User
  cover_letter: string
  proposed_price: string
  estimated_days: number
  status: ProposalStatus
  created_at: string
  updated_at: string
}

export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING FUNDS'

export interface Contract {
  id: number
  job: Job
  proposal: Proposal
  client: User
  freelancer: User
  price: string
  deadline: string
  status: ContractStatus
  started_at: string
  completed_at: string | null
}

export type DeliverableStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Deliverable {
  id: number
  contract: number
  submitted_by: User
  message: string
  file: string
  status: DeliverableStatus
  version: number
  created_at: string
}

export interface Wallet {
  id: number
  user: number
  available_balance: string
  escrow_balance: string
  updated_at: string
}

export type TransactionDirection = 'CREDIT' | 'DEBIT'
export type TransactionType =
  | 'DEPOSIT'
  | 'ESCROW_LOCK'
  | 'ESCROW_RELEASE'
  | 'REFUND'
  | 'WITHDRAWAL'
  | 'EARNING'
  | 'ADJUSTMENT'
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface Transaction {
  id: number
  wallet: number
  amount: string
  direction: TransactionDirection
  type: TransactionType
  status: TransactionStatus
  reference_type: string | null
  reference_id: number | null
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  role: UserRole
}

export interface TokenResponse {
  access: string
  refresh: string
}
