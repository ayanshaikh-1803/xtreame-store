import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { idsAPI } from '../services/api';
import IDCard from '../components/IDCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import './Marketplace.css';

const CATEGORIES = ['Basic ID', 'Normal ID', 'Best ID', 'Super ID', 'Extreme ID'];
const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Elite Heroic', 'Master', 'Elite Master', 'Grandmaster'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'level_desc', label: 'Level: High to Low' },
  { value: 'views', label: 'Most Viewed' }
];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    rank: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
  });

  // Separate state for the search input (shown in the box) vs the debounced value sent to API
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const searchDebounceRef = useRef(null);

  const fetchIDs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };

      // Only add non-empty filters
      if (filters.search)   params.search   = filters.search;
      if (filters.category) params.category = filters.category;  // exact string e.g. "Basic ID"
      if (filters.status)   params.status   = filters.status;
      if (filters.rank)     params.rank     = filters.rank;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort)     params.sort     = filters.sort;

      const res = await idsAPI.getAll(params);
      setIds(res.data.ids);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchIDs(); }, [fetchIDs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Debounced handler specifically for the search input
  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 500);
  };

  const clearFilters = () => {
    setSearchInput('');
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setFilters({ search: '', category: '', status: '', rank: '', minPrice: '', maxPrice: '', sort: '' });
    setPage(1);
  };

  const hasActiveFilters = searchInput || Object.entries(filters).some(([k, v]) => k !== 'search' && v);

  return (
    <div className="marketplace page-enter">
      <div className="marketplace__header">
        <div className="container">
          <h1 className="marketplace__title">🎮 Marketplace</h1>
          <p className="marketplace__subtitle">{total} IDs available</p>
        </div>
      </div>

      <div className="container marketplace__body">
        {/* Search + Filter Bar */}
        <div className="marketplace__toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, UID..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchInput && (
              <button onClick={() => handleSearchChange('')}><FiX /></button>
            )}
          </div>

          <div className="toolbar__right">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="sort-select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters {hasActiveFilters && <span className="filter-dot" />}
            </button>

            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                <FiX /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel glass-card">
            <div className="filter-group">
              <label>Category</label>
              <div className="filter-chips">
                <button
                  className={`chip ${!filters.category ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', '')}
                >All</button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`chip ${filters.category === c ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <div className="filter-chips">
                <button className={`chip ${!filters.status ? 'active' : ''}`} onClick={() => handleFilterChange('status', '')}>All</button>
                <button className={`chip ${filters.status === 'available' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'available')}>Available</button>
                <button className={`chip ${filters.status === 'sold' ? 'active' : ''}`} onClick={() => handleFilterChange('status', 'sold')}>Sold</button>
              </div>
            </div>

            <div className="filter-group">
              <label>Rank</label>
              <div className="filter-chips">
                <button className={`chip ${!filters.rank ? 'active' : ''}`} onClick={() => handleFilterChange('rank', '')}>All</button>
                {RANKS.map((r) => (
                  <button key={r} className={`chip ${filters.rank === r ? 'active' : ''}`} onClick={() => handleFilterChange('rank', r)}>{r}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Price Range (₹)</label>
              <div className="price-range">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                <span>—</span>
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : ids.length === 0 ? (
          <div className="empty-state">
            <span>🎮</span>
            <h3>No IDs found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="ids-grid">
              {ids.map((id) => <IDCard key={id._id} id={id} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
