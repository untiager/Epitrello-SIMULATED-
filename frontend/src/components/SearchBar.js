import React, { useState } from 'react';
import { searchApi } from '../services/api';

const SearchBar = ({ onSearchResults, boardId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    dueDateFrom: '',
    dueDateTo: '',
    hasComments: false,
    hasAttachments: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = {
        query: searchQuery,
        boardId,
        ...filters,
      };

      const response = await searchApi.search(params);
      onSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({
      dueDateFrom: '',
      dueDateTo: '',
      hasComments: false,
      hasAttachments: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onSearchResults([]);
  };

  const handleQuickFilter = async (type) => {
    setLoading(true);
    try {
      let response;
      if (type === 'overdue') {
        response = await searchApi.getOverdue({ boardId });
      } else if (type === 'dueSoon') {
        response = await searchApi.getDueSoon({ boardId });
      }
      onSearchResults(response.data);
    } catch (error) {
      console.error('Quick filter failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="advanced-btn"
          >
            {showAdvanced ? 'Hide Filters' : 'Advanced'}
          </button>
          <button type="button" onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Due Date From:</label>
              <input
                type="date"
                value={filters.dueDateFrom}
                onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Due Date To:</label>
              <input
                type="date"
                value={filters.dueDateTo}
                onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasComments}
                  onChange={(e) => handleFilterChange('hasComments', e.target.checked)}
                />
                Has Comments
              </label>
            </div>

            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasAttachments}
                  onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
                />
                Has Attachments
              </label>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
                <option value="comments">Comments</option>
                <option value="attachments">Attachments</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order:</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <div className="quick-filters">
        <button onClick={() => handleQuickFilter('overdue')} disabled={loading}>
          Overdue Cards
        </button>
        <button onClick={() => handleQuickFilter('dueSoon')} disabled={loading}>
          Due Soon
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
