'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

export default function AddListing() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    location: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  const categories = [
    'Vehicles',
    'Property Rentals',
    'Apparel',
    'Classifieds',
    'Electronics',
    'Entertainment',
    'Family',
    'Free Stuff',
    'Garden & Outdoor',
    'Hobbies',
    'Home Goods',
    'Home Improvement',
    'Home Sales',
    'Musical Instruments',
    'Office Supplies',
    'Pet Supplies',
    'Sporting Goods',
    'Toys & Games',
    'Buy and sell groups'
  ]

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Clear previous messages
      setMessage('')
      setMessageType('')
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        setMessageType('error')
        return
      }
      
      // Validate file size (max 2MB for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image file must be less than 2MB')
        setMessageType('error')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear messages when user starts typing
    if (message) {
      setMessage('')
      setMessageType('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setMessageType('')

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Please enter a title')
      }
      if (!formData.description.trim()) {
        throw new Error('Please enter a description')
      }
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        throw new Error('Please enter a valid price')
      }
      if (!formData.location.trim()) {
        throw new Error('Please enter a location')
      }

      // Create listing
      const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            category: formData.category,
            location: formData.location.trim(),
            image_url: imagePreview, // Store base64 image data
            user_id: user.id,
            user_email: user.email
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setMessage('Listing created successfully! Redirecting to marketplace...')
      setMessageType('success')
      
      // Redirect to home page after success
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      console.error('Error creating listing:', error)
      setMessage(error.message || 'Error creating listing. Please try again.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
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
          <p className="text-gray-600 mb-6">Please sign in to create a listing</p>
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
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
            <p className="text-gray-600 text-lg">Fill in the details below to create your marketplace listing</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500 text-base"
                placeholder="What are you selling?"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500 text-base resize-vertical"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500 text-base"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 text-base"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500 text-base"
                placeholder="City, State"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-gray-800 mb-2">
                Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-2 border-gray-200">
                      <span className="text-gray-400 text-2xl">📷</span>
                    </div>
                  )}
                  <span className="text-blue-600 font-semibold text-lg">
                    {imagePreview ? 'Change Photo' : 'Add Photo'}
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    Click to upload an image (max 2MB)
                  </span>
                </label>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg border-2 ${
                messageType === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Listing...
                  </span>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
