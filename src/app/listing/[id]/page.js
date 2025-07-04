'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import supabase from '@/lib/supabaseClient'

export default function ListingDetail() {
  const router = useRouter()
  const params = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState(false)

  useEffect(() => {
    const getSessionAndListing = async () => {
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUser = sessionData.session?.user ?? null
        setUser(sessionUser)
        
        if (sessionUser && sessionUser.email) {
          setBuyerEmail(sessionUser.email)
          console.log('User email set:', sessionUser.email)
        }

        // Get listing details
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .single()

        if (listingError) {
          throw listingError
        }

        if (!listingData) {
          setError('Listing not found')
          return
        }

        setListing(listingData)
      } catch (err) {
        console.error('Error loading listing:', err)
        setError('Failed to load listing details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      getSessionAndListing()
    }
  }, [params.id])

  const handleMessageSeller = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/?login=true')
      return
    }

    if (!message.trim() || !buyerName.trim() || !buyerEmail.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSendingMessage(true)
    
    try {
      console.log('Sending message with data:', {
        listing_id: listing.id,
        seller_id: listing.user_id,
        seller_email: listing.email,
        buyer_id: user.id,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        message: message.trim(),
        listing_title: listing.title,
        listing_price: listing.price
      })

      // Save message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          listing_id: listing.id,
          seller_id: listing.user_id,
          seller_email: listing.user_email || listing.email, // Handle both field names
          buyer_id: user.id,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          message: message.trim(),
          listing_title: listing.title,
          listing_price: listing.price
        })
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Message saved successfully:', data)

      // For now, skip the email notification since we don't have the Edge Function set up
      // TODO: Set up Supabase Edge Function for email notifications
      
      setMessageSuccess(true)
      setMessage('')
      setBuyerName('')
      
      setTimeout(() => {
        setMessageSuccess(false)
      }, 3000)
      
    } catch (err) {
      console.error('Error sending message:', err)
      
      // More specific error messages
      let errorMessage = 'Failed to send message. Please try again.'
      
      if (err.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please make sure you are signed in.'
      } else if (err.message?.includes('violates row-level security')) {
        errorMessage = 'Security error. Please refresh the page and try again.'
      } else if (err.message?.includes('duplicate')) {
        errorMessage = 'Message already sent. Please wait before sending another.'
      }
      
      alert(errorMessage)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Listing not found'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="mr-2">←</span>
                <span>Back to Marketplace</span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Marketplace</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 relative">
                {listing.image_url ? (
                  <Image
                    src={listing.image_url}
                    alt={listing.title}
                    fill
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 opacity-50"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:40px_40px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-6xl">📷</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Price and Title */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${listing.price.toFixed(2)}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {listing.title}
                </h1>
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <span>📍 {listing.location}</span>
                  <span>🏷️ {listing.category}</span>
                  <span>📅 {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Seller Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                <div className="text-gray-700">
                  <div className="mb-1">
                    <strong>Email:</strong> {listing.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Listed {new Date(listing.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {user && user.id === listing.user_id ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">This is your listing</p>
                    <div className="mt-3 space-x-3">
                      <button
                        onClick={() => router.push('/my-listings')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Manage Listings
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Message Form */}
                    <div className="bg-white border border-gray-200/50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Seller</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                          <span>Safe messaging</span>
                        </div>
                      </div>

                      {messageSuccess ? (
                        <div className="text-center py-6">
                          <div className="text-green-600 text-4xl mb-3">✅</div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h4>
                          <p className="text-gray-600 mb-4">The seller has been notified and will respond via email.</p>
                          <button
                            onClick={() => setMessageSuccess(false)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Send another message
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Name *
                              </label>
                              <input
                                type="text"
                                value={buyerName}
                                onChange={(e) => setBuyerName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                                placeholder="Enter your name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Email *
                              </label>
                              <input
                                type="email"
                                value={buyerEmail}
                                onChange={(e) => setBuyerEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                                placeholder="Enter your email"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Message *
                            </label>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder-gray-500"
                              placeholder={`Hi! I'm interested in your "${listing.title}" listing. Is it still available?`}
                            />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">Be specific about your interest</span>
                              <span className="text-xs text-gray-500">{message.length}/500</span>
                            </div>
                          </div>

                          <button
                            onClick={handleMessageSeller}
                            disabled={sendingMessage || !message.trim() || !buyerName.trim() || !buyerEmail.trim()}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {sendingMessage ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <span>💬</span>
                                <span>Send Message</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Alternative Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`mailto:${listing.email}?subject=Interested in ${listing.title}&body=Hi, I'm interested in your listing: ${listing.title} for $${listing.price}`}
                        className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                      >
                        📧 Email Directly
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href)
                          alert('Link copied to clipboard!')
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        🔗 Share Listing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Safety Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Meet in a public place for transactions</li>
                <li>• Inspect items carefully before purchasing</li>
                <li>• Don&apos;t send money before seeing the item</li>
                <li>• Trust your instincts about buyers/sellers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
