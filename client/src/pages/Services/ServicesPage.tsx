import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useServices } from '../../hooks/useServices'
import type { SearchParams } from '../../services/api'

const categories = [
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'painting', name: 'Painting' },
  { id: 'landscaping', name: 'Landscaping' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'roofing', name: 'Roofing' },
]

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    limit: 9,
    page: 1,
  })

  const { data: services, isLoading, error } = useServices(searchParams)

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      query: searchQuery || undefined,
      category: selectedCategory || undefined,
    }))
  }, [searchQuery, selectedCategory])

  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page on new search
    }))
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading services. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button 
              className="btn-primary"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(
                    category.id === selectedCategory ? null : category.id
                  )}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{service.provider}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-600">{service.rating}</span>
                <span className="mx-1 text-gray-400">•</span>
                <span className="text-sm text-gray-600">{service.reviews} reviews</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{service.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{service.price}</span>
                <button className="btn-primary">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {services?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No services found. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  )
} 