'use client'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'

export default function Marketplace() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Electronics')

  const categories = [
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

  const mockProducts = [
    { id: 1, price: '$99', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 2, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 3, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 4, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 5, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 6, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 7, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 8, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 9, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 10, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 11, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 12, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 13, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 14, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' },
    { id: 15, price: '$2,300', description: 'Lorem ipsum dolor sit Palo Alto, CA', location: 'Palo Alto, CA' }
  ]

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      // Don't automatically show modal - let user browse freely
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        setShowModal(false)
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

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}>
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            {/* Create New Listing */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Create new listing</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full flex items-center text-left p-2 rounded transition-colors ${
                    user 
                      ? 'text-gray-600 hover:bg-gray-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => !user ? setShowModal(true) : null}
                >
                  <span className="mr-2">📝</span>
                  Choose listing type
                </button>
                <button 
                  className={`w-full flex items-center text-left p-2 rounded transition-colors ${
                    user 
                      ? 'text-gray-600 hover:bg-gray-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => !user ? setShowModal(true) : null}
                >
                  <span className="mr-2">📋</span>
                  Your listings
                </button>
                <button 
                  className={`w-full flex items-center text-left p-2 rounded transition-colors ${
                    user 
                      ? 'text-gray-600 hover:bg-gray-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's picks</h2>
              
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Product Image Placeholder */}
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 opacity-50"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]"></div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <div className="font-bold text-lg text-gray-900 mb-1">{product.price}</div>
                      <div className="text-sm text-gray-600 mb-2">{product.description}</div>
                      <div className="text-xs text-gray-500">{product.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Marketplace</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Sign in to browse and interact with listings</p>
            
            <div className="space-y-4">
              <input
                type="email"
                className="border border-gray-300 p-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <button
                className="bg-blue-600 text-white px-6 py-4 w-full rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                onClick={handleLogin}
              >
                Send Magic Link
              </button>
            </div>
            
            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
              >
                Browse as guest (limited features)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
