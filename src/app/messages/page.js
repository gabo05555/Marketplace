'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import NotificationBadge from '@/components/NotificationBadge'

export default function Messages() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState(new Set())

  useEffect(() => {
    const getSessionAndMessages = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data.session?.user ?? null
        setUser(sessionUser)
        
        if (!sessionUser) {
          router.push('/')
          return
        }

        await fetchMessages(sessionUser.id)
      } catch (error) {
        console.error('Error getting session:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    getSessionAndMessages()
  }, [router])

  const fetchMessages = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    }
  }

  const markAsRead = async (messageId) => {
    setMarkingAsRead(prev => new Set(prev).add(messageId))
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_by_seller: true })
        .eq('id', messageId)

      if (error) throw error

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_by_seller: true }
            : msg
        )
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }
  }

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    setShowMessageModal(true)
    
    if (!message.read_by_seller) {
      markAsRead(message.id)
    }
  }

  const unreadCount = messages.filter(msg => !msg.read_by_seller).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your messages</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Messages</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Messages</h2>
                <p className="text-gray-600 mt-1">
                  Messages from interested buyers
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} className="bg-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500 mb-6">
                  When buyers are interested in your listings, their messages will appear here.
                </p>
                <button
                  onClick={() => router.push('/add-listing')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create a Listing
                </button>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.read_by_seller ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {message.buyer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {message.buyer_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!message.read_by_seller && (
                            <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {message.buyer_email}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>About:</strong> {message.listing_title} (${message.listing_price})
                      </p>
                      <p className="text-gray-900 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Message from {selectedMessage.buyer_name}
                  </h2>
                  <p className="text-gray-600">
                    About: {selectedMessage.listing_title}
                  </p>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Listing Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Listing Details</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>Title:</strong> {selectedMessage.listing_title}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Price:</strong> ${selectedMessage.listing_price}
                  </p>
                  <button
                    onClick={() => router.push(`/listing/${selectedMessage.listing_id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Listing →
                  </button>
                </div>

                {/* Buyer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Buyer Information</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>Name:</strong> {selectedMessage.buyer_name}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Email:</strong> {selectedMessage.buyer_email}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Message sent:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Message */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <a
                    href={`mailto:${selectedMessage.buyer_email}?subject=Re: ${selectedMessage.listing_title}&body=Hi ${selectedMessage.buyer_name},%0D%0A%0D%0AThank you for your interest in my listing: ${selectedMessage.listing_title}%0D%0A%0D%0A`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                  >
                    📧 Reply via Email
                  </a>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
