import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import StarRating from '../components/StarRating';
import {
  Search as SearchIcon, MapPin, IndianRupee, SlidersHorizontal,
  ArrowUpDown, X, CheckCircle, XCircle
} from 'lucide-react';
import './Search.css';

const CATEGORIES = [
  '', 'Home Repairs', 'Cleaning', 'Tutoring', 'IT Support',
  'Wellness', 'Beauty', 'Moving', 'Other'
];

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minRating: searchParams.get('minRating') || '',
    maxRate: searchParams.get('maxRate') || '',
    sortBy: searchParams.get('sortBy') || '',
  });

  useEffect(() => {
    fetchProviders();
  }, [searchParams]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.location) params.set('location', filters.location);
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.maxRate) params.set('maxRate', filters.maxRate);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const data = await api.get(`/providers?${params.toString()}`);
      setProviders(data.providers || data || []);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', location: '', minRating: '', maxRate: '', sortBy: '' });
    setSearchParams({});
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #7c3aed, #a855f7)',
      'linear-gradient(135deg, #06b6d4, #22d3ee)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #fbbf24)',
      'linear-gradient(135deg, #f43f5e, #fb7185)',
      'linear-gradient(135deg, #3b82f6, #60a5fa)',
      'linear-gradient(135deg, #ec4899, #f472b6)',
    ];
    const index = (name || '').charCodeAt(0) % colors.length;
    return colors[index];
  };

  const hasActiveFilters = filters.category || filters.location || filters.minRating || filters.maxRate || filters.sortBy;

  return (
    <div className="search-page page-container">
      <div className="search-header">
        <h1>Find <span className="gradient-text">Services</span></h1>
        <p>Discover top-rated professionals near you</p>
      </div>

      {/* Search Bar */}
      <form className="search-bar glass-card-static" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search services or providers..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="search-input"
          />
        </div>
        <button type="button" className={`filter-toggle btn btn-ghost ${filtersOpen ? 'active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={18} />
          Filters
          {hasActiveFilters && <span className="filter-badge" />}
        </button>
        <button type="submit" className="btn btn-primary">
          <SearchIcon size={18} />
          Search
        </button>
      </form>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="filters-panel glass-card-static">
          <div className="filters-grid">
            <div className="input-group">
              <label>Category</label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label><MapPin size={14} /> Location</label>
              <input
                type="text"
                className="input-field"
                placeholder="City or area..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Min Rating</label>
              <select
                className="input-field"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="input-group">
              <label><IndianRupee size={14} /> Max Rate (₹/hr)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Max hourly rate"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                min="0"
              />
            </div>

            <div className="input-group">
              <label><ArrowUpDown size={14} /> Sort By</label>
              <select
                className="input-field"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={16} />
              Clear All
            </button>
            <button className="btn btn-primary btn-sm" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="providers-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SearchIcon size={36} />
          </div>
          <h3>No Providers Found</h3>
          <p>Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: '16px' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="results-count">
            <span>{providers.length} provider{providers.length !== 1 ? 's' : ''} found</span>
          </div>
          <div className="providers-grid">
            {providers.map((p, i) => (
              <div
                key={p._id}
                className="provider-card glass-card"
                onClick={() => navigate(`/provider/${p._id}`)}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="provider-card-top">
                  <div
                    className="provider-avatar"
                    style={{ background: getAvatarColor(p.name) }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="provider-card-info">
                    <h3>{p.name}</h3>
                    <span className="badge badge-category">{p.category}</span>
                  </div>
                  <div className="provider-availability">
                    {p.availability !== false ? (
                      <span className="avail-badge available"><CheckCircle size={12} /> Available</span>
                    ) : (
                      <span className="avail-badge unavailable"><XCircle size={12} /> Unavailable</span>
                    )}
                  </div>
                </div>

                <div className="provider-card-body">
                  <div className="provider-rating-row">
                    <StarRating rating={p.rating || 0} size={16} />
                    <span className="review-count">({p.reviewCount || 0})</span>
                  </div>
                  <div className="provider-meta">
                    {p.location && (
                      <span><MapPin size={14} /> {p.location}</span>
                    )}
                    <span><IndianRupee size={14} /> ₹{p.hourlyRate}/hr</span>
                  </div>
                  {p.skills && p.skills.length > 0 && (
                    <div className="skills-list">
                      {p.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                      {p.skills.length > 4 && (
                        <span className="skill-tag" style={{ opacity: 0.5 }}>+{p.skills.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
