import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StarRating from '../components/StarRating';
import {
  Users, Briefcase, IndianRupee, Star, BarChart3,
  Calendar, Clock, MapPin, Trash2, Search, Filter,
  TrendingUp, Award, ShieldCheck, BookOpen, Package,
  ChevronLeft, ChevronRight, Eye, AlertTriangle, MessageSquare
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPages, setBookingsPages] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPages, setReviewsPages] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeSection === 'users') fetchUsers();
    if (activeSection === 'bookings') fetchBookings();
    if (activeSection === 'reviews') fetchReviews();
  }, [activeSection, usersPage, bookingsPage, reviewsPage, userRoleFilter, bookingStatusFilter]);

  const fetchStats = async () => {
    try {
      const data = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page: usersPage, limit: 10 });
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter);
      if (userSearch) params.set('search', userSearch);
      const data = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setUsersTotal(data.total);
      setUsersPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams({ page: bookingsPage, limit: 10 });
      if (bookingStatusFilter !== 'all') params.set('status', bookingStatusFilter);
      const data = await api.get(`/admin/bookings?${params}`);
      setBookings(data.bookings);
      setBookingsTotal(data.total);
      setBookingsPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({ page: reviewsPage, limit: 10 });
      const data = await api.get(`/admin/reviews?${params}`);
      setReviews(data.reviews);
      setReviewsTotal(data.total);
      setReviewsPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/admin/${type}/${id}`);
      setDeleteConfirm(null);
      if (type === 'users') fetchUsers();
      if (type === 'bookings') fetchBookings();
      if (type === 'reviews') fetchReviews();
      fetchStats();
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    setUsersPage(1);
    fetchUsers();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-pending', accepted: 'badge-accepted', completed: 'badge-completed',
      rejected: 'badge-rejected', cancelled: 'badge-cancelled',
    };
    return `badge ${classes[status] || 'badge-pending'}`;
  };

  const getRoleBadge = (role) => {
    const classes = { customer: 'badge-customer', provider: 'badge-provider', admin: 'badge-admin' };
    return `badge ${classes[role] || ''}`;
  };

  const sections = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'bookings', label: 'Bookings', icon: Briefcase },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard page-container">
      <div className="admin-header">
        <div>
          <h1><ShieldCheck size={28} className="admin-icon" /> Admin <span className="gradient-text">Panel</span></h1>
          <p>Monitor and manage the ServiceHub platform</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="admin-tabs">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`admin-tab ${activeSection === key ? 'active' : ''}`}
            onClick={() => setActiveSection(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === 'overview' && stats && (
        <div className="admin-overview">
          <div className="stats-grid">
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'var(--primary-gradient)' }}><Users size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}><Users size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalCustomers}</span>
                <span className="stat-label">Customers</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}><Award size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalProviders}</span>
                <span className="stat-label">Providers</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}><IndianRupee size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">₹{stats.totalRevenue}</span>
                <span className="stat-label">Total Revenue</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}><Briefcase size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalBookings}</span>
                <span className="stat-label">Total Bookings</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}><Star size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgPlatformRating?.toFixed(1) || '0.0'}</span>
                <span className="stat-label">Avg Rating</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #14b8a6, #5eead4)' }}><MessageSquare size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalReviews}</span>
                <span className="stat-label">Reviews</span>
              </div>
            </div>
            <div className="stat-card glass-card-static">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}><TrendingUp size={22} /></div>
              <div className="stat-info">
                <span className="stat-value">{stats.recentSignups}</span>
                <span className="stat-label">New (30d)</span>
              </div>
            </div>
          </div>

          {/* Booking Status Breakdown */}
          <div className="admin-section-card glass-card-static">
            <h3><BookOpen size={18} /> Booking Status Breakdown</h3>
            <div className="status-breakdown">
              <div className="status-bar-item">
                <span className="status-label-row"><span className="badge badge-pending">Pending</span></span>
                <div className="status-bar"><div className="status-fill pending" style={{ width: `${stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings * 100) : 0}%` }}></div></div>
                <span className="status-count">{stats.pendingBookings}</span>
              </div>
              <div className="status-bar-item">
                <span className="status-label-row"><span className="badge badge-accepted">Accepted</span></span>
                <div className="status-bar"><div className="status-fill accepted" style={{ width: `${stats.totalBookings > 0 ? (stats.acceptedBookings / stats.totalBookings * 100) : 0}%` }}></div></div>
                <span className="status-count">{stats.acceptedBookings}</span>
              </div>
              <div className="status-bar-item">
                <span className="status-label-row"><span className="badge badge-completed">Completed</span></span>
                <div className="status-bar"><div className="status-fill completed" style={{ width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings * 100) : 0}%` }}></div></div>
                <span className="status-count">{stats.completedBookings}</span>
              </div>
              <div className="status-bar-item">
                <span className="status-label-row"><span className="badge badge-rejected">Rejected</span></span>
                <div className="status-bar"><div className="status-fill rejected" style={{ width: `${stats.totalBookings > 0 ? (stats.rejectedBookings / stats.totalBookings * 100) : 0}%` }}></div></div>
                <span className="status-count">{stats.rejectedBookings}</span>
              </div>
              <div className="status-bar-item">
                <span className="status-label-row"><span className="badge badge-cancelled">Cancelled</span></span>
                <div className="status-bar"><div className="status-fill cancelled" style={{ width: `${stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings * 100) : 0}%` }}></div></div>
                <span className="status-count">{stats.cancelledBookings}</span>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          {stats.categoryStats?.length > 0 && (
            <div className="admin-section-card glass-card-static">
              <h3><BarChart3 size={18} /> Provider Categories</h3>
              <div className="category-grid">
                {stats.categoryStats.map((cat) => (
                  <div key={cat._id} className="category-stat-card">
                    <span className="category-name">{cat._id}</span>
                    <span className="category-count">{cat.count} providers</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* USERS SECTION */}
      {activeSection === 'users' && (
        <div className="admin-data-section">
          <div className="admin-filters">
            <form onSubmit={handleUserSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="filter-group">
              <Filter size={14} />
              <select className="input-field filter-select" value={userRoleFilter} onChange={(e) => { setUserRoleFilter(e.target.value); setUsersPage(1); }}>
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper glass-card-static">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell">No users found</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id}>
                    <td><div className="user-cell"><div className="avatar avatar-xs">{u.name[0].toUpperCase()}</div>{u.name}</div></td>
                    <td className="email-cell">{u.email}</td>
                    <td><span className={getRoleBadge(u.role)}>{u.role}</span></td>
                    <td>{u.category || '—'}</td>
                    <td>{u.role === 'provider' ? `${u.rating?.toFixed(1)} (${u.reviewsCount})` : '—'}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn-icon btn-icon-danger" title="Delete user" onClick={() => setDeleteConfirm({ type: 'users', id: u._id, name: u.name })}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usersPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span className="page-info">Page {usersPage} of {usersPages} ({usersTotal} total)</span>
                <button className="btn btn-ghost btn-sm" disabled={usersPage === usersPages} onClick={() => setUsersPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS SECTION */}
      {activeSection === 'bookings' && (
        <div className="admin-data-section">
          <div className="admin-filters">
            <div className="filter-group">
              <Filter size={14} />
              <select className="input-field filter-select" value={bookingStatusFilter} onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingsPage(1); }}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper glass-card-static">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell">No bookings found</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.customer?.name || 'Unknown'}</td>
                    <td>{b.provider?.name || 'Unknown'}</td>
                    <td>{b.service}</td>
                    <td>{formatDate(b.date)}</td>
                    <td>{b.totalPrice ? `₹${b.totalPrice}` : '—'}</td>
                    <td><span className={getStatusBadge(b.status)}>{b.status}</span></td>
                    <td>
                      <button className="btn-icon btn-icon-danger" title="Delete booking" onClick={() => setDeleteConfirm({ type: 'bookings', id: b._id, name: `${b.service} booking` })}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookingsPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={bookingsPage === 1} onClick={() => setBookingsPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span className="page-info">Page {bookingsPage} of {bookingsPages} ({bookingsTotal} total)</span>
                <button className="btn btn-ghost btn-sm" disabled={bookingsPage === bookingsPages} onClick={() => setBookingsPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVIEWS SECTION */}
      {activeSection === 'reviews' && (
        <div className="admin-data-section">
          <div className="admin-table-wrapper glass-card-static">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr><td colSpan="6" className="empty-cell">No reviews found</td></tr>
                ) : reviews.map((r) => (
                  <tr key={r._id}>
                    <td>{r.customer?.name || 'Unknown'}</td>
                    <td>{r.provider?.name || 'Unknown'}</td>
                    <td><StarRating rating={r.rating} size={14} /></td>
                    <td className="comment-cell">{r.comment || '—'}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <button className="btn-icon btn-icon-danger" title="Delete review" onClick={() => setDeleteConfirm({ type: 'reviews', id: r._id, name: `review by ${r.customer?.name}` })}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reviewsPages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={reviewsPage === 1} onClick={() => setReviewsPage(p => p - 1)}><ChevronLeft size={16} /></button>
                <span className="page-info">Page {reviewsPage} of {reviewsPages} ({reviewsTotal} total)</span>
                <button className="btn btn-ghost btn-sm" disabled={reviewsPage === reviewsPages} onClick={() => setReviewsPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content glass-card-static delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <AlertTriangle size={36} />
            </div>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
