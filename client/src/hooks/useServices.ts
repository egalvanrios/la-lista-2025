import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../services/api'
import type { SearchParams, Service } from '../services/api'

export function useServices(params: SearchParams) {
  return useQuery<Service[]>({
    queryKey: ['services', params],
    queryFn: () => servicesApi.search(params),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })
}

export function useService(id: number) {
  return useQuery<Service>({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(id),
    staleTime: 1000 * 60 * 5,
  })
} 