import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../config/api'
import { useAuth } from '../contexts/AuthContext'

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
    email: string
  }
  rating: number
  reviewCount: number
  reviews: Review[]
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer: {
    firstName: string
    lastName: string
  }
  createdAt: string
}

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')

  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`)
      return response.data
    }
  })

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/bookings', {
        serviceId: id,
        date: bookingDate,
        time: bookingTime,
      })
      setShowBookingModal(false)
      // Show success message or redirect to bookings page
    } catch (error) {
      console.error('Error creating booking:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="text-center text-red-600">
        An error occurred while loading the service. Please try again later.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="ml-1 text-gray-600 text-lg">
                {service.rating.toFixed(1)}
              </span>
            </div>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600">{service.reviewCount} reviews</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600">{service.category}</span>
          </div>

          <p className="text-gray-700 mb-6">{service.description}</p>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h2>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-900 font-medium">
                  {service.provider.firstName} {service.provider.lastName}
                </p>
                <p className="text-gray-600">{service.provider.email}</p>
              </div>
              {user?.role === 'HOMEOWNER' && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
            {service.reviews.length > 0 ? (
              <div className="space-y-6">
                {service.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-gray-600">{review.rating}</span>
                      </div>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-600">
                        {review.reviewer.firstName} {review.reviewer.lastName}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Book Service</h3>
            <form onSubmit={handleBooking}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetailsPage 