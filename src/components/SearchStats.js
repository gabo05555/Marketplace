'use client'

export default function SearchStats({ stats, searchQuery, selectedCategory, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    )
  }

  const hasActiveSearch = searchQuery.trim() || selectedCategory !== 'All'
  const resultText = stats.filtered === 1 ? 'result' : 'results'
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {!hasActiveSearch ? 'All Listings' : 
           searchQuery ? `Search Results` : 
           `${selectedCategory} Listings`}
        </h2>
        
        {hasActiveSearch && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {stats.filtered} {resultText}
            </span>
            {stats.hasActiveFilters && stats.total > stats.filtered && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {stats.filterPercentage}% filtered
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        {searchQuery && (
          <div className="flex items-center space-x-1">
            <span>Searching for:</span>
            <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
              "{searchQuery}"
            </span>
          </div>
        )}
        
        {!hasActiveSearch && (
          <span>{stats.total} {stats.total === 1 ? 'item' : 'items'}</span>
        )}
      </div>
    </div>
  )
}
