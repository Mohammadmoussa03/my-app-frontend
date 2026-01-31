'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserProfile, LoginCredentials, SignupData, TokenResponse } from './types'
import { api } from './api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<{ error?: string }>
  signup: (data: SignupData) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')

    if (storedUser && storedUser !== 'undefined' && accessToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const { data, error } = await api.post<TokenResponse>('/api/account/login/', {
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      return { error }
    }

    if (data) {
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      // Fetch user profile (now includes nested user object with role)
      const { data: profileData } = await api.get<any>('/api/account/profile/me/')
      
      if (profileData) {
        // Extract user data from nested user object in profile response
        const userData: User = {
          id: profileData.user?.id || profileData.id,
          email: profileData.user?.email || credentials.email,
          role: profileData.user?.role || 'FREELANCER',
          profile: {
            id: profileData.id,
            full_name: profileData.full_name || '',
            bio: profileData.bio || '',
            country: profileData.country || '',
            avatar: profileData.avatar || null,
            skills: profileData.skills || '',
            company_name: profileData.company_name || '',
          }
        }
        
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        router.push('/dashboard')
      }
    }

    return {}
  }

  const signup = async (signupData: SignupData) => {
    const { error } = await api.post('/api/account/signup/', signupData)

    if (error) {
      return { error }
    }

    // Auto-login after signup
    return login({ email: signupData.email, password: signupData.password })
  }

  const logout = async () => {
    await api.post('/api/account/logout/', {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
