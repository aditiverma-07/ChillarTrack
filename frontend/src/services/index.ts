import api from './api'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authService = {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return res.data
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return res.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}

export const transactionService = {
  async getAll(params?: Record<string, unknown>) {
    const res = await api.get('/transactions', { params })
    return res.data
  },
  async create(data: unknown) {
    const res = await api.post('/transactions', data)
    return res.data
  },
  async update(id: string, data: unknown) {
    const res = await api.put(`/transactions/${id}`, data)
    return res.data
  },
  async delete(id: string) {
    const res = await api.delete(`/transactions/${id}`)
    return res.data
  },
}

export const goalService = {
  async getAll() {
    const res = await api.get('/goals')
    return res.data
  },
  async create(data: unknown) {
    const res = await api.post('/goals', data)
    return res.data
  },
  async update(id: string, data: unknown) {
    const res = await api.put(`/goals/${id}`, data)
    return res.data
  },
  async delete(id: string) {
    const res = await api.delete(`/goals/${id}`)
    return res.data
  },
}

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary')
    return res.data
  },
  async getAnalytics(params?: Record<string, unknown>) {
    const res = await api.get('/dashboard/analytics', { params })
    return res.data
  },
}

export const profileService = {
  async get() {
    const res = await api.get('/profile')
    return res.data
  },
  async update(data: unknown) {
    const res = await api.put('/profile', data)
    return res.data
  },
}

export const notificationService = {
  async getAll() {
    const res = await api.get('/notifications')
    return res.data
  },
  async markAsRead(id: string) {
    const res = await api.put(`/notifications/${id}/read`)
    return res.data
  },
}
