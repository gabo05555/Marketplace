'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import SearchFilter from '@/components/SearchFilter'
import SearchStats from '@/components/SearchStats'
import Pagination from '@/components/Pagination'
import { useEnhancedSearch, usePagination } from '@/hooks/useEnhancedSearch'

export default function Marketplace() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Enhanced search functionality - filter by category first
  const categoryFilteredListings = listings.filter(listing => 
    selectedCategory === 'All' || listing.category === selectedCategory
  )
  
  const searchFields = ['title', 'description', 'location', 'category']
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredData,
    suggestions,
    stats
  } = useEnhancedSearch(categoryFilteredListings, searchFields)

  // Pagination
  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    hasNext,
    hasPrevious,
    startIndex,
    endIndex
  } = usePagination(filteredData, 20)

  const categories = [
    { name: 'All', icon: '🏪' },
    { name: 'Vehicles', icon: '🚗' },
    { name: 'Property Rentals', icon: '🏠' },
    { name: 'Apparel', icon: '👕' },
    { name: 'Classifieds', icon: '📋' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Family', icon: '👨‍👩‍👧‍👦' },
    { name: 'Free Stuff', icon: '🆓' },
    { name: 'Garden & Outdoor', icon: '🌱' },
    { name: 'Hobbies', icon: '🎨' },
    { name: 'Home Goods', icon: '🏡' },
    { name: 'Home Improvement', icon: '🔨' },
    { name: 'Home Sales', icon: '🏘️' },
    { name: 'Musical Instruments', icon: '🎸' },
    { name: 'Office Supplies', icon: '📝' },
    { name: 'Pet Supplies', icon: '🐕' },
    { name: 'Sporting Goods', icon: '⚽' },
    { name: 'Toys & Games', icon: '🎮' },
    { name: 'Buy and sell groups', icon: '🛒' }
  ]

  // Fetch listings from Supabase
  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  // Update search data when category changes
  useEffect(() => {
    // Reset search when category changes
    setSearchQuery('')
  }, [selectedCategory, setSearchQuery])

  // Delete listing function
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
        .eq('user_id', user.id) // Extra security check

      if (error) throw error

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId))
      
      // Show success message briefly
      setMessage('Listing deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      // Don't automatically show modal - let user browse freely
    }

    getSession()
    fetchListings()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        setShowModal(false)
        // Refresh listings when user logs in
        fetchListings()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className={`bg-white shadow-sm border-b transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Marketplace</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Hello, {user.email}</span>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              )}
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

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            {/* Create New Listing */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Create new listing</h3>
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center text-left p-2 rounded transition-colors text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    if (user) {
                      router.push('/add-listing')
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <span className="mr-2">📝</span>
                  Choose listing type
                </button>
                <button 
                  className="w-full flex items-center text-left p-2 rounded transition-colors text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    if (user) {
                      router.push('/my-listings')
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <span className="mr-2">📋</span>
                  Your listings
                </button>
                <button 
                  className="w-full flex items-center text-left p-2 rounded transition-colors text-gray-600 hover:bg-gray-50"
                  onClick={() => !user ? setShowModal(true) : null}
                >
                  <span className="mr-2">❓</span>
                  Seller help
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center text-left p-2 rounded text-sm transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Search Filter */}
              <SearchFilter
                onSearch={setSearchQuery}
                onFiltersChange={setFilters}
                initialQuery={searchQuery}
                showAdvancedFilters={true}
                categories={categories}
                listings={categoryFilteredListings}
              />

              {/* Search Stats */}
              <SearchStats
                stats={stats}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                loading={loading}
              />
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : currentData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    {searchQuery ? '�' : '�🛒'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No search results found' : 'No listings found'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? `No listings match your search criteria. Try different keywords or adjust your filters.`
                      : selectedCategory === 'All' 
                        ? 'Be the first to create a listing!' 
                        : `No items found in ${selectedCategory}.`}
                  </p>
                  {(searchQuery || stats.hasActiveFilters) ? (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilters({
                          sortBy: 'newest',
                          priceRange: { min: '', max: '' },
                          selectedCategories: [],
                          dateRange: { from: '', to: '' }
                        })
                      }}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium mr-4"
                    >
                      Clear Search & Filters
                    </button>
                  ) : null}
                  {user && (
                    <button
                      onClick={() => router.push('/add-listing')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {searchQuery ? 'Create New Listing' : 'Create First Listing'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {currentData.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow relative"
                    >
                      {/* Delete Button (only for user's own listings) */}
                      {user && user.id === listing.user_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteListing(listing.id)
                          }}
                          disabled={deleteLoading === listing.id}
                          className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg disabled:opacity-50"
                          title="Delete listing"
                        >
                          {deleteLoading === listing.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <span className="text-sm">×</span>
                          )}
                        </button>
                      )}

                      {/* Product Image */}
                      <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden cursor-pointer">
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
                      <div className="p-3">
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          ${listing.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900 font-medium mb-1 truncate">
                          {listing.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {listing.description}
                        </div>
                        <div className="text-xs text-gray-500">{listing.location}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                        {/* Owner indicator */}
                        {user && user.id === listing.user_id && (
                          <div className="text-xs text-blue-600 font-medium mt-2">
                            Your listing
                          </div>
                        )}                          {/* Search match highlights */}
                          {listing.searchMatches && (
                            <div className="text-xs text-green-600 mt-2">
                              Match: {listing.searchMatches.map(match => match.key).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={filteredData.length}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out border-2 border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600 text-base">Sign in to your Marketplace account</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 text-base"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <button
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleLogin}
              >
                Send Magic Link
              </button>
            </div>
            
            {message && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">{message}</p>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors font-medium"
              >
                Continue browsing as guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
