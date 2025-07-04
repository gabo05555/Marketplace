import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'

export function useEnhancedSearch(data, searchFields, options = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    priceRange: { min: '', max: '' },
    selectedCategories: [],
    dateRange: { from: '', to: '' }
  })

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const fuseOptions = {
      keys: searchFields,
      threshold: 0.3, // Lower = more exact matches
      distance: 100,
      includeScore: true,
      includeMatches: true,
      ...options.fuseOptions
    }
    
    return new Fuse(data, fuseOptions)
  }, [data, searchFields, options.fuseOptions])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let results = data

    // Apply text search
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery)
      results = fuseResults.map(result => ({
        ...result.item,
        searchScore: result.score,
        searchMatches: result.matches
      }))
    }

    // Apply filters
    results = results.filter(item => {
      // Price filter
      if (filters.priceRange.min && item.price < parseFloat(filters.priceRange.min)) {
        return false
      }
      if (filters.priceRange.max && item.price > parseFloat(filters.priceRange.max)) {
        return false
      }

      // Category filter
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(item.category)) {
        return false
      }

      // Date filter
      if (filters.dateRange.from) {
        const itemDate = new Date(item.created_at)
        const fromDate = new Date(filters.dateRange.from)
        if (itemDate < fromDate) return false
      }
      if (filters.dateRange.to) {
        const itemDate = new Date(item.created_at)
        const toDate = new Date(filters.dateRange.to)
        toDate.setHours(23, 59, 59, 999) // End of day
        if (itemDate > toDate) return false
      }

      return true
    })

    // Apply sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'title':
          return a.title.localeCompare(b.title)
        case 'location':
          return a.location.localeCompare(b.location)
        case 'relevance':
          // Sort by search score if available (lower score = better match)
          if (searchQuery.trim()) {
            return (a.searchScore || 0) - (b.searchScore || 0)
          }
          return new Date(b.created_at) - new Date(a.created_at)
        default:
          return 0
      }
    })

    return results
  }, [data, fuse, searchQuery, filters])

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []
    
    const uniqueSuggestions = new Set()
    
    // Get fuzzy matches for suggestions
    const fuseResults = fuse.search(searchQuery, { limit: 20 })
    
    fuseResults.forEach(result => {
      if (result.matches) {
        result.matches.forEach(match => {
          if (match.value && match.value.length > 2) {
            // Extract words that contain the search query
            const words = match.value.split(/\s+/)
            words.forEach(word => {
              if (word.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  word.length > 2 && 
                  word.toLowerCase() !== searchQuery.toLowerCase()) {
                uniqueSuggestions.add(word)
              }
            })
          }
        })
      }
    })
    
    return Array.from(uniqueSuggestions).slice(0, 6)
  }, [fuse, searchQuery])

  // Statistics
  const stats = useMemo(() => {
    const total = data.length
    const filtered = filteredData.length
    const hasActiveFilters = 
      filters.selectedCategories.length > 0 || 
      filters.priceRange.min || 
      filters.priceRange.max || 
      filters.dateRange.from || 
      filters.dateRange.to ||
      searchQuery.trim()

    return {
      total,
      filtered,
      hasActiveFilters,
      filterPercentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    }
  }, [data, filteredData, filters, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredData,
    suggestions,
    stats
  }
}

// Pagination hook
export function usePagination(data, itemsPerPage = 20) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, data.length)
  }
}
