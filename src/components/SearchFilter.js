'use client';

import { useState, useEffect, useRef } from 'react';

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange,
  suggestions = [],
  onSuggestionClick 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const searchRef = useRef(null);

  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalSearchTerm(suggestion);
    onSuggestionClick(suggestion);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const categories = [
    'All Categories',
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health & Beauty'
  ];

  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $250', value: '100-250' },
    { label: 'Over $250', value: '250+' }
  ];

  const conditions = [
    'Any Condition',
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
  ];

  return (
    <div className="search-filter-container">
      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-bar" ref={searchRef}>
          <div className="search-input-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search for items..."
              value={localSearchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(localSearchTerm.length > 0 && suggestions.length > 0)}
              className="search-input"
            />
            {localSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <svg className="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
          </svg>
          <span>Filters</span>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filters?.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <select
                value={filters?.priceRange || ''}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                {priceRanges.map((range) => (
                  <option key={range.label} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="filter-group">
              <label className="filter-label">Condition</label>
              <select
                value={filters?.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="filter-select"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition === 'Any Condition' ? '' : condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <input
                type="text"
                placeholder="Enter location..."
                value={filters?.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <button
              onClick={() => {
                onFilterChange('category', '');
                onFilterChange('priceRange', '');
                onFilterChange('condition', '');
                onFilterChange('location', '');
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="apply-filters-btn"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters?.category || filters?.priceRange || filters?.condition || filters?.location) && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {filters.category && (
            <span className="filter-tag">
              {filters.category}
              <button onClick={() => handleFilterChange('category', '')}>×</button>
            </span>
          )}
          {filters.priceRange && (
            <span className="filter-tag">
              {priceRanges.find(r => r.value === filters.priceRange)?.label}
              <button onClick={() => handleFilterChange('priceRange', '')}>×</button>
            </span>
          )}
          {filters.condition && (
            <span className="filter-tag">
              {filters.condition}
              <button onClick={() => handleFilterChange('condition', '')}>×</button>
            </span>
          )}
          {filters.location && (
            <span className="filter-tag">
              {filters.location}
              <button onClick={() => handleFilterChange('location', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
