import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'HOMEOWNER' | 'PROVIDER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'HOMEOWNER' | 'PROVIDER'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me')
          setUser(response.data)
        } catch (error) {
          console.error('Error loading user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      navigate('/')
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred during login')
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setError(null)
      const response = await api.post('/auth/register', userData)
      const { token: newToken, user: newUser } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)
      navigate('/')
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred during registration')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null)
      const response = await api.patch('/auth/me', data)
      setUser(response.data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while updating profile')
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 