import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../config/api'
import { useAuth } from '../contexts/AuthContext'

interface Booking {
  id: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes: string
  service: {
    id: string
    title: string
    price: number
    provider: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

const HomeownerDashboard: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [review, setReview] = useState({ rating: 5, comment: '' })

  // Fetch homeowner's bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['homeowner-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings')
      return response.data
    },
  })

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await api.delete(`/bookings/${bookingId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner-bookings'] })
    },
  })

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async ({ bookingId, review }: { bookingId: string; review: { rating: number; comment: string } }) => {
      await api.post(`/services/${selectedBooking?.service.id}/reviews`, review)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner-bookings'] })
      setShowReviewModal(false)
      setSelectedBooking(null)
      setReview({ rating: 5, comment: '' })
    },
  })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedBooking) {
      submitReviewMutation.mutate({
        bookingId: selectedBooking.id,
        review,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const activeBookings = bookings?.filter(
    (booking) => booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  )
  const completedBookings = bookings?.filter(
    (booking) => booking.status === 'COMPLETED'
  )
  const cancelledBookings = bookings?.filter(
    (booking) => booking.status === 'CANCELLED'
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {/* Active Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Active Bookings</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {activeBookings?.map((booking) => (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/services/${booking.service.id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {booking.service.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Provider: {booking.service.provider.firstName}{' '}
                        {booking.service.provider.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => cancelBookingMutation.mutate(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {activeBookings?.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">
                  No active bookings
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed Bookings</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {completedBookings?.map((booking) => (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/services/${booking.service.id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {booking.service.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Provider: {booking.service.provider.firstName}{' '}
                        {booking.service.provider.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowReviewModal(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Leave Review
                    </button>
                  </div>
                </li>
              ))}
              {completedBookings?.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">
                  No completed bookings
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Cancelled Bookings */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancelled Bookings</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {cancelledBookings?.map((booking) => (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={`/services/${booking.service.id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {booking.service.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Provider: {booking.service.provider.firstName}{' '}
                        {booking.service.provider.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      CANCELLED
                    </span>
                  </div>
                </li>
              ))}
              {cancelledBookings?.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">
                  No cancelled bookings
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Review for {selectedBooking.service.title}
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    id="rating"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={review.rating}
                    onChange={(e) =>
                      setReview({ ...review, rating: parseInt(e.target.value) })
                    }
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={review.comment}
                    onChange={(e) =>
                      setReview({ ...review, comment: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedBooking(null)
                    setReview({ rating: 5, comment: '' })
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeownerDashboard 