import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User, AuthResponse } from '@/types'
import { authService } from '@/services'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.clear()
      }
    }
    setIsLoading(false)
  }, [])

  const persistAuth = (response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    persistAuth(res.data)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password })
    persistAuth(res.data)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try { await authService.logout(refreshToken) } catch {}
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updated: User) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
