'use client'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from 'use-debounce'

export default function SearchFilter({ 
  onSearch, 
  onFiltersChange, 
  initialQuery = '',
  showAdvancedFilters = false,
  categories = [],
  listings = [] 
}) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery] = useDebounce(query, 300)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('marketplace_search_history')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Handle search query changes
  useEffect(() => {
    onSearch(debouncedQuery)
    
    // Generate suggestions based on current query
    if (debouncedQuery && debouncedQuery.length > 1) {
      const uniqueSuggestions = new Set()
      
      // Add suggestions from listings
      listings.forEach(listing => {
        const words = [
          ...listing.title.split(' '),
          ...listing.description.split(' '),
          listing.location,
          listing.category
        ]
        
        words.forEach(word => {
          if (word.toLowerCase().includes(debouncedQuery.toLowerCase()) && 
              word.length > 2) {
            uniqueSuggestions.add(word)
          }
        })
      })
      
      setSuggestions(Array.from(uniqueSuggestions).slice(0, 6))
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, listings, onSearch])

  // Handle filters change
  useEffect(() => {
    onFiltersChange({
      sortBy,
      priceRange,
      selectedCategories,
      dateRange
    })
  }, [sortBy, priceRange, selectedCategories, dateRange, onFiltersChange])

  const handleSearch = (searchTerm) => {
    setQuery(searchTerm)
    setShowSuggestions(false)
    
    // Add to search history
    if (searchTerm.trim()) {
      const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('marketplace_search_history', JSON.stringify(newHistory))
    }
  }

  const clearSearch = () => {
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    setSelectedCategories([])
    setDateRange({ from: '', to: '' })
    setSortBy('newest')
  }

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative" ref={suggestionsRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
            placeholder="Search listings by title, description, location, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            {query && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-lg">×</span>
              </button>
            )}
            {showAdvancedFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded transition-colors ${
                  showFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Advanced filters"
              >
                <span className="text-sm">⚙️</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (query || searchHistory.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* Current query suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    <span className="mr-2">🔍</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Search history */}
            {searchHistory.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-1">Recent searches</div>
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(historyItem)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-sm text-gray-700 transition-colors"
                  >
                    <span className="mr-2">🕐</span>
                    {historyItem}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sort and Quick Actions */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="title">Title A-Z</option>
            <option value="location">Location A-Z</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {(selectedCategories.length > 0 || priceRange.min || priceRange.max || dateRange.from || dateRange.to) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear filters
            </button>
          )}
          {showAdvancedFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {categories.filter(cat => cat.name !== 'All').map(category => (
                  <label key={category.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category.icon} {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || priceRange.min || priceRange.max || dateRange.from || dateRange.to) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategories.map(category => (
                <span key={category} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {category}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {priceRange.min && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Min: ${priceRange.min}
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Max: ${priceRange.max}
                </span>
              )}
              {dateRange.from && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  From: {dateRange.from}
                </span>
              )}
              {dateRange.to && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  To: {dateRange.to}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
