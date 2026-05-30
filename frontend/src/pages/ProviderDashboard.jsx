import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StarRating from '../components/StarRating';
import {
  Calendar, Clock, IndianRupee, Star, BarChart3,
  CheckCircle, XCircle, User, Save, Tag, MapPin, Phone,
  Award, FileText, ToggleLeft, ToggleRight, Briefcase, Package
} from 'lucide-react';
import './Dashboard.css';

const CATEGORIES = [
  'Home Repairs', 'Cleaning', 'Tutoring', 'IT Support',
  'Wellness', 'Beauty', 'Moving', 'Other'
];

const TABS = ['pending', 'accepted', 'completed'];

const ProviderDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showProfile, setShowProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    skills: '',
    location: '',
    experience: '',
    category: '',
    phone: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchBookings();
    if (user) {
      setProfileForm({
        bio: user.bio || '',
        skills: (user.skills || []).join(', '),
        location: user.location || '',
        experience: user.experience || '',
        category: user.category || 'Home Repairs',
        phone: user.phone || '',
        isAvailable: user.isAvailable !== false,
      });
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/bookings');
      setBookings(data.bookings || data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: 'accepted' });
      fetchBookings();
    } catch (err) {
      console.error('Failed to accept:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: 'rejected' });
      fetchBookings();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/bookings/${id}/complete`);
      fetchBookings();
    } catch (err) {
      console.error('Failed to complete:', err);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: profileForm.bio,
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        location: profileForm.location,
        experience: Number(profileForm.experience),
        category: profileForm.category,
        phone: profileForm.phone,
        isAvailable: profileForm.isAvailable,
      });
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = bookings.filter(b => b.status === activeTab);

  const totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const acceptedCount = bookings.filter(b => ['accepted', 'completed'].includes(b.status)).length;
  const totalRequests = bookings.filter(b => b.status !== 'cancelled').length;
  const acceptanceRate = totalRequests > 0 ? Math.round((acceptedCount / totalRequests) * 100) : 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      completed: 'badge-completed',
      rejected: 'badge-rejected',
      cancelled: 'badge-cancelled',
    };
    return `badge ${classes[status] || 'badge-pending'}`;
  };

  return (
    <div className="dashboard page-container">
      <div className="dashboard-header">
        <div>
          <h1>Provider <span className="gradient-text">Dashboard</span></h1>
          <p>Manage your services and bookings</p>
        </div>
        <button
          className={`btn ${showProfile ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowProfile(!showProfile)}
        >
          <User size={16} />
          {showProfile ? 'View Bookings' : 'Edit Profile'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-overview">
        <div className="overview-card glass-card-static">
          <div className="overview-icon" style={{ background: 'var(--primary-gradient)' }}>
            <Briefcase size={20} />
          </div>
          <div className="overview-info">
            <span className="overview-value">{bookings.length}</span>
            <span className="overview-label">Total Bookings</span>
          </div>
        </div>
        <div className="overview-card glass-card-static">
          <div className="overview-icon" style={{ background: 'var(--secondary-gradient)' }}>
            <Star size={20} />
          </div>
          <div className="overview-info">
            <span className="overview-value">{user?.rating?.toFixed(1) || '0.0'}</span>
            <span className="overview-label">Rating</span>
          </div>
        </div>
        <div className="overview-card glass-card-static">
          <div className="overview-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <IndianRupee size={20} />
          </div>
          <div className="overview-info">
            <span className="overview-value">₹{totalEarnings}</span>
            <span className="overview-label">Earnings</span>
          </div>
        </div>
        <div className="overview-card glass-card-static">
          <div className="overview-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <BarChart3 size={20} />
          </div>
          <div className="overview-info">
            <span className="overview-value">{acceptanceRate}%</span>
            <span className="overview-label">Accept Rate</span>
          </div>
        </div>
      </div>

      {showProfile ? (
        /* Profile Edit Section */
        <div className="profile-edit glass-card-static">
          <h2>Edit Profile</h2>
          <div className="profile-form">
            <div className="input-group">
              <label><FileText size={14} /> Bio</label>
              <textarea
                className="input-field"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell clients about yourself..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Category</label>
                <select
                  className="input-field"
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label><IndianRupee size={14} /> Hourly Rate (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profileForm.ratePerHour}
                  onChange={(e) => setProfileForm({ ...profileForm, ratePerHour: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label><Phone size={14} /> Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="input-group">
                <label><Tag size={14} /> Skills (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  placeholder="e.g., Plumbing, Electrical, Painting"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label><MapPin size={14} /> Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label><Award size={14} /> Experience (years)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="availability-toggle">
              <span>Availability</span>
              <button
                type="button"
                className={`toggle-btn ${profileForm.isAvailable ? 'active' : ''}`}
                onClick={() => setProfileForm({ ...profileForm, isAvailable: !profileForm.isAvailable })}
              >
                {profileForm.isAvailable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                {profileForm.isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </div>

            <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
              {saving ? <span className="spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Booking Tabs */}
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="tab-count">
                  {bookings.filter(b => b.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner spinner-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Package size={36} />
              </div>
              <h3>No {activeTab} Bookings</h3>
              <p>Your {activeTab} bookings will appear here</p>
            </div>
          ) : (
            <div className="bookings-list">
              {filtered.map((booking, i) => (
                <div key={booking._id} className="booking-card glass-card-static" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="booking-card-header">
                    <div className="booking-provider-row">
                      <div className="avatar avatar-md" style={{ background: 'var(--secondary-gradient)' }}>
                        {(booking.customer?.name || booking.user?.name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <h3>{booking.customer?.name || booking.user?.name || 'Customer'}</h3>
                        <p className="booking-service">{booking.service}</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                  </div>

                  <div className="booking-details">
                    <div className="booking-detail">
                      <Calendar size={15} />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    {booking.time && (
                      <div className="booking-detail">
                        <Clock size={15} />
                        <span>{booking.time}</span>
                      </div>
                    )}
                    {booking.totalPrice && (
                      <div className="booking-detail">
                        <IndianRupee size={15} />
                        <span>₹{booking.totalPrice}</span>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="booking-notes">
                      <span>Notes:</span> {booking.notes}
                    </div>
                  )}

                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleAccept(booking._id)}>
                          <CheckCircle size={14} />
                          Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(booking._id)}>
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleComplete(booking._id)}>
                        <CheckCircle size={14} />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderDashboard;
