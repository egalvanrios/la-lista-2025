import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Service types
export interface Service {
  id: number
  title: string
  category: string
  provider: string
  rating: number
  reviews: number
  price: string
  description: string
}

export interface SearchParams {
  query?: string
  category?: string
  location?: string
  page?: number
  limit?: number
}

// API functions
export const servicesApi = {
  search: async (params: SearchParams) => {
    const response = await api.get<Service[]>('/services', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<Service>(`/services/${id}`)
    return response.data
  },

  create: async (data: Omit<Service, 'id'>) => {
    const response = await api.post<Service>('/services', data)
    return response.data
  },

  update: async (id: number, data: Partial<Service>) => {
    const response = await api.patch<Service>(`/services/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/services/${id}`)
  },
}

export default api 