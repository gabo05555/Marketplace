'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import supabase from '@/lib/supabaseClient'
import SearchFilter from '@/components/SearchFilter'
import SearchStats from '@/components/SearchStats'
import Pagination from '@/components/Pagination'
import NotificationBadge from '@/components/NotificationBadge'
import { useEnhancedSearch, usePagination } from '@/hooks/useEnhancedSearch'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

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

  // Unread messages notification
  const { unreadCount } = useUnreadMessages(user)

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
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Modern Top Navigation */}
      <nav className={`bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/30 sticky top-0 z-40 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🏪</span>
                </div>
                <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Marketplace</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-gray-700 font-medium">Hello, {user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Success Message */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white border border-green-200/50 text-green-800 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border-opacity-20">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="flex gap-8">
          {/* Modern Sidebar */}
          <div className="w-72 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/20 p-6">
            {/* Create New Listing */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center text-left p-4 rounded-2xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-md group"
                  onClick={() => {
                    if (user) {
                      router.push('/add-listing')
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <div>
                    <p className="font-semibold">Create Listing</p>
                    <p className="text-sm text-gray-500">Sell your items</p>
                  </div>
                </button>
                <button 
                  className="w-full flex items-center text-left p-4 rounded-2xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-md group"
                  onClick={() => {
                    if (user) {
                      router.push('/my-listings')
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <div>
                    <p className="font-semibold">Your Listings</p>
                    <p className="text-sm text-gray-500">Manage your items</p>
                  </div>
                </button>
                <button 
                  className="w-full flex items-center justify-between text-left p-4 rounded-2xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-gray-900 hover:shadow-md group"
                  onClick={() => {
                    if (user) {
                      router.push('/messages')
                    } else {
                      setShowModal(true)
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <div>
                      <p className="font-semibold">Your Messages</p>
                      <p className="text-sm text-gray-500">Chat with buyers</p>
                    </div>
                  </div>
                  {user && unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} className="ml-2 shadow-lg" />
                  )}
                </button>
                <button 
                  className="w-full flex items-center text-left p-4 rounded-2xl transition-all duration-200 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-gray-900 hover:shadow-md group"
                  onClick={() => !user ? setShowModal(true) : null}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <span className="text-white text-lg">❓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Seller Help</p>
                    <p className="text-sm text-gray-500">Get support</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Modern Categories */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center text-left p-3 rounded-xl text-sm transition-all duration-200 ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all ${
                      selectedCategory === category.name 
                        ? 'bg-white/20' 
                        : 'bg-gray-100'
                    }`}>
                      <span className="text-base">{category.icon}</span>
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Main Content */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/20 p-8">
              {/* Enhanced Search Filter */}
              <div className="mb-8">
                <SearchFilter
                  onSearch={setSearchQuery}
                  onFiltersChange={setFilters}
                  initialQuery={searchQuery}
                  showAdvancedFilters={true}
                  categories={categories}
                  listings={categoryFilteredListings}
                />
              </div>

              {/* Enhanced Search Stats */}
              <div className="mb-6">
                <SearchStats
                  stats={stats}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  loading={loading}
                />
              </div>
              
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 font-semibold text-lg">Loading amazing items...</p>
                    <p className="text-gray-500 text-sm mt-2">Discovering the best deals for you</p>
                  </div>
                </div>
              ) : currentData.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-soft">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={searchQuery ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"} />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchQuery ? 'No search results found' : 'No listings found'}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    {searchQuery 
                      ? `No listings match your search criteria. Try different keywords or adjust your filters.`
                      : selectedCategory === 'All' 
                        ? 'Be the first to create a listing and start selling!' 
                        : `No items found in ${selectedCategory}. Try exploring other categories.`}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {(searchQuery || stats.hasActiveFilters) && (
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
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl 
                                 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg 
                                 hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center space-x-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Clear Search & Filters</span>
                      </button>
                    )}
                    {user && (
                      <button
                        onClick={() => router.push('/add-listing')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl 
                                 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg 
                                 hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center space-x-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Create Your First Listing</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {currentData.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white border border-gray-200/50 rounded-3xl overflow-hidden hover:shadow-lifted 
                               hover:border-gray-300/60 transition-all duration-300 relative cursor-pointer group 
                               hover:-translate-y-1 transform shadow-soft"
                      onClick={() => router.push(`/listing/${listing.id}`)}
                    >
                      {/* Delete Button (only for user's own listings) */}
                      {user && user.id === listing.user_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteListing(listing.id)
                          }}
                          disabled={deleteLoading === listing.id}
                          className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-red-600 
                                   hover:from-red-600 hover:to-red-700 text-white rounded-full w-9 h-9 
                                   flex items-center justify-center transition-all duration-200 shadow-lg 
                                   disabled:opacity-50 hover:shadow-xl transform hover:scale-105"
                          title="Delete listing"
                        >
                          {deleteLoading === listing.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}

                      {/* Product Image */}
                      <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden 
                                    cursor-pointer group-hover:shadow-inner">
                        {listing.image_url ? (
                          <Image
                            src={listing.image_url}
                            alt={listing.title}
                            fill
                            quality={85}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 opacity-60"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <div className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          ${listing.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900 font-semibold mb-2 truncate">
                          {listing.title}
                        </div>
                        <div className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs text-gray-500 font-medium">{listing.location}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {/* Owner indicator */}
                        {user && user.id === listing.user_id && (
                          <div className="inline-flex items-center space-x-1 text-xs text-blue-600 font-medium mt-3 
                                        bg-blue-50 px-2 py-1 rounded-full">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Your listing</span>
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
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out border border-gray-200/50">
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
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 text-base"
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
              <div className="mt-6 p-4 bg-green-50 border border-green-200/50 rounded-lg">
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
