import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../config/api'

interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  provider: {
    id: string
    firstName: string
    lastName: string
  }
  rating: number
  reviewCount: number
}

const ServicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['services', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await api.get(`/services?${params.toString()}`)
      return response.data
    }
  })

  const categories = [
    'Cleaning',
    'Plumbing',
    'Electrical',
    'Painting',
    'Carpentry',
    'Landscaping',
    'HVAC',
    'Other'
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        An error occurred while loading services. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search services..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Link
            key={service.id}
            to={`/services/${service.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 font-semibold">
                    ${service.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {service.provider.firstName} {service.provider.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-600">
                      {service.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {service.reviewCount} reviews
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {services?.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No services found matching your criteria.
        </div>
      )}
    </div>
  )
}

export default ServicesPage 