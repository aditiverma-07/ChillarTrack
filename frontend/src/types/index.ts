// ============================================================
// Core API Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  monthlyBudget: number
  weeklyLimit: number
  currency: string
  profilePhotoUrl?: string
  emailVerified: boolean
  notificationsEnabled: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

// ============================================================
// Transaction Types
// ============================================================

export type TransactionCategory =
  | 'FOOD_AND_TAPRI'
  | 'TRANSPORT'
  | 'PRINTOUTS_AND_STATIONERY'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'EDUCATION'
  | 'MISCELLANEOUS'

export type PaymentMethod = 'CASH' | 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD'

export interface Transaction {
  id: string
  amount: number
  category: TransactionCategory
  categoryDisplay: string
  description?: string
  transactionDate: string
  paymentMethod: PaymentMethod
  paymentMethodDisplay: string
  createdAt: string
}

export interface CreateTransactionRequest {
  amount: number
  category: TransactionCategory
  description?: string
  transactionDate: string
  paymentMethod: PaymentMethod
}

// ============================================================
// Goal Types
// ============================================================

export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  imageUrl?: string
  completed: boolean
  progressPercentage: number
  remainingAmount: number
  estimatedCompletionInfo?: string
  createdAt: string
}

export interface CreateGoalRequest {
  title: string
  targetAmount: number
  currentAmount?: number
  targetDate?: string
  imageUrl?: string
}

// ============================================================
// Notification Types
// ============================================================

export type NotificationType =
  | 'BUDGET_ALERT'
  | 'GOAL_REMINDER'
  | 'SPENDING_SPIKE'
  | 'ENTERTAINMENT_LIMIT'
  | 'WEEKLY_SUMMARY'
  | 'ACHIEVEMENT_EARNED'
  | 'SYSTEM'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardSummary {
  monthlyBudget: number
  totalSpentThisMonth: number
  remainingBalance: number
  totalSavings: number
  weeklySpent: number
  weeklyLimit: number
  activeGoalsCount: number
  unreadNotificationsCount: number
  recentTransactions: Transaction[]
  activeGoals: SavingsGoal[]
  latestAlerts: Notification[]
}

export interface DailySpending {
  date: string
  amount: number
}

export interface WeeklySpending {
  week: string
  amount: number
}

export interface CategorySpending {
  category: TransactionCategory
  categoryDisplay: string
  amount: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  amount: number
}

export interface AnalyticsData {
  dailySpending: DailySpending[]
  weeklySpending: WeeklySpending[]
  categoryBreakdown: CategorySpending[]
  monthlyTrend: MonthlyTrend[]
}

// ============================================================
// Filter/Params Types
// ============================================================

export interface TransactionFilters {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
  category?: TransactionCategory
  search?: string
  startDate?: string
  endDate?: string
}
