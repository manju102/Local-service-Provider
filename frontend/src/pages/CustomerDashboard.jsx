import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import {
  Calendar, Clock, MapPin, IndianRupee, XCircle,
  MessageSquare, Package, CheckCircle, AlertCircle
} from 'lucide-react';
import './Dashboard.css';

const TABS = ['all', 'pending', 'accepted', 'completed'];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const handleCancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeTab);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard page-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, <span className="gradient-text">{user?.name}</span></h1>
          <p>Manage your bookings and services</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'All Bookings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span className="tab-count">
                {bookings.filter(b => b.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={36} />
          </div>
          <h3>No {activeTab !== 'all' ? activeTab : ''} Bookings</h3>
          <p>Your bookings will appear here</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filtered.map((booking, i) => (
            <div key={booking._id} className="booking-card glass-card-static" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="booking-card-header">
                <div className="booking-provider-row">
                  <div className="avatar avatar-md">
                    {(booking.provider?.name || 'P')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3>{booking.provider?.name || 'Provider'}</h3>
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
                {booking.address && (
                  <div className="booking-detail">
                    <MapPin size={15} />
                    <span>{booking.address}</span>
                  </div>
                )}
                {booking.totalPrice && (
                  <div className="booking-detail">
                    <IndianRupee size={15} />
                    <span>₹{booking.totalPrice}</span>
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking._id)}>
                    <XCircle size={14} />
                    Cancel
                  </button>
                )}
                {booking.status === 'completed' && !booking.reviewed && (
                  <button className="btn btn-primary btn-sm" onClick={() => setReviewBooking(booking)}>
                    <MessageSquare size={14} />
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewed={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
