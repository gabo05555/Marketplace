'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

export default function MyListings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data.session?.user ?? null
        setUser(sessionUser)
        
        if (!sessionUser) {
          router.push('/')
          return
        }

        // Fetch user's listings
        await fetchUserListings(sessionUser.id)
      } catch (error) {
        console.error('Error getting session:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (!sessionUser) {
        router.push('/')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  const fetchUserListings = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching user listings:', error)
      setListings([])
    }
  }

  const handleDeleteListing = async (listingId) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return
    }

    setDeleteLoading(listingId)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId))
      
      setMessage('Listing deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your listings</p>
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
                <span className="mr-2 text-lg">←</span>
                <span className="text-lg font-semibold">Back to Marketplace</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Hello, {user.email}</span>
              <button
                onClick={() => router.push('/add-listing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add Listing
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mx-4 mt-4 rounded-lg">
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600 text-lg">Manage your marketplace listings</p>
            </div>
            <div className="text-gray-500">
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
            </div>
          </div>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any listings. Start selling by creating your first listing!
              </p>
              <button
                onClick={() => router.push('/add-listing')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 opacity-50"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-2xl">📷</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-gray-900">
                        ${listing.price.toFixed(2)}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {listing.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium mb-2 line-clamp-2">
                      {listing.title}
                    </div>
                    <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {listing.description}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{listing.location}</div>
                    <div className="text-xs text-gray-400 mb-4">
                      Created: {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={deleteLoading === listing.id}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors font-medium text-sm disabled:opacity-50"
                      >
                        {deleteLoading === listing.id ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                      <button
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors font-medium text-sm"
                        onClick={() => alert('Edit functionality coming soon!')}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
