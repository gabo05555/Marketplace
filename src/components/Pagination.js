'use client'
import { useState } from 'react'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  hasNext,
  hasPrevious,
  startIndex,
  endIndex,
  totalItems,
  itemsPerPage = 20
}) {
  const [inputPage, setInputPage] = useState('')

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputPage)
      if (page >= 1 && page <= totalPages) {
        onPageChange(page)
        setInputPage('')
      }
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)
      
      // Calculate range around current page
      const start = Math.max(2, currentPage - 2)
      const end = Math.min(totalPages - 1, currentPage + 2)
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }
      
      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8 p-6 
                  bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-soft border border-gray-200">
      {/* Results Info */}
      <div className="text-sm text-gray-600 font-medium">
        Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
        <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="px-4 py-2 text-sm font-medium border border-gray-200/50 rounded-xl 
                   hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                   hover:shadow-md hover:border-gray-300/60 flex items-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-4 py-2 text-sm font-medium border rounded-xl transition-all duration-200 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg transform scale-105'
                  : page === '...'
                  ? 'border-transparent cursor-default text-gray-400'
                  : 'border-gray-200/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300/60 hover:shadow-md'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="px-4 py-2 text-sm font-medium border border-gray-200/50 rounded-xl 
                   hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                   hover:shadow-md hover:border-gray-300/60 flex items-center space-x-2"
        >
          <span>Next</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Jump to Page */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyPress={handlePageInput}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={currentPage.toString()}
        />
        <span className="text-gray-600">of {totalPages}</span>
      </div>
    </div>
  )
}
