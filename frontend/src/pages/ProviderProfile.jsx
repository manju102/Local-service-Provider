import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import StarRating from '../components/StarRating';
import BookingModal from '../components/BookingModal';
import {
  MapPin, IndianRupee, Clock, Award, CheckCircle, XCircle,
  Calendar, MessageSquare, ArrowLeft, Briefcase, User, Phone, PhoneCall
} from 'lucide-react';
import './ProviderProfile.css';

const ProviderProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [providerData, reviewData] = await Promise.all([
        api.get(`/providers/${id}`),
        api.get(`/reviews/provider/${id}`).catch(() => ({ reviews: [] })),
      ]);
      setProvider(providerData.provider || providerData);
      setReviews(reviewData.reviews || reviewData || []);
    } catch (err) {
      console.error('Failed to fetch provider:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner spinner-lg" />
          <p style={{ color: 'var(--text-tertiary)' }}>Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Provider Not Found</h3>
          <p>This provider may no longer be available.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-profile page-container">
      <Link to="/search" className="back-link">
        <ArrowLeft size={18} />
        Back to Search
      </Link>

      {/* Provider Header */}
      <div className="profile-header glass-card-static">
        <div className="profile-avatar-section">
          <div className="profile-avatar avatar avatar-xl">
            {getInitials(provider.name)}
          </div>
          <div className="profile-header-info">
            <h1>{provider.name}</h1>
            <div className="profile-badges">
              <span className="badge badge-category">
                <Briefcase size={12} />
                {provider.category}
              </span>
              {provider.availability !== false ? (
                <span className="avail-badge available"><CheckCircle size={12} /> Available</span>
              ) : (
                <span className="avail-badge unavailable"><XCircle size={12} /> Unavailable</span>
              )}
            </div>
            <div className="profile-stats-row">
              <div className="profile-stat">
                <StarRating rating={provider.rating || 0} size={18} />
                <span className="stat-sub">({provider.reviewCount || reviews.length} reviews)</span>
              </div>
              <div className="profile-stat">
                <IndianRupee size={16} />
                <span className="stat-main">₹{provider.hourlyRate}</span>
                <span className="stat-sub">/hour</span>
              </div>
              {provider.experience && (
                <div className="profile-stat">
                  <Award size={16} />
                  <span className="stat-main">{provider.experience}</span>
                  <span className="stat-sub">years exp.</span>
                </div>
              )}
              {provider.location && (
                <div className="profile-stat">
                  <MapPin size={16} />
                  <span className="stat-sub">{provider.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {user && user.role !== 'provider' ? (
          <div className="profile-actions-row">
            <button className="btn btn-primary btn-lg book-cta" onClick={() => setShowBooking(true)}>
              <Calendar size={18} />
              Book Service
            </button>
            {provider.phone && (
              <a href={`tel:${provider.phone}`} className="btn btn-success btn-lg book-cta" style={{ flex: 'none', padding: '0 1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <PhoneCall size={18} />
                Call Provider
              </a>
            )}
          </div>
        ) : !user ? (
          <Link to="/login" className="btn btn-outline btn-lg book-cta">
            Login to Book
          </Link>
        ) : null}
      </div>

      <div className="profile-body">
        {/* About Section */}
        <div className="profile-section">
          <h2><User size={20} /> About</h2>
          <div className="glass-card-static section-content">
            {provider.phone && (
              <div className="provider-contact-info" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem' }}>
                <Phone size={18} style={{ color: '#10b981' }} /> <strong>Contact:</strong> {provider.phone}
              </div>
            )}
            <p className="bio-text">{provider.bio || 'No bio provided.'}</p>
            {provider.skills && provider.skills.length > 0 && (
              <div className="profile-skills">
                <h3>Skills & Services</h3>
                <div className="skills-list">
                  {provider.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="profile-section">
          <h2><MessageSquare size={20} /> Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="glass-card-static section-content">
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <h3>No Reviews Yet</h3>
                <p>Be the first to leave a review!</p>
              </div>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, i) => (
                <div key={review._id || i} className="review-card glass-card-static" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="review-header">
                    <div className="review-user">
                      <div className="avatar avatar-sm" style={{ background: 'var(--secondary-gradient)' }}>
                        {getInitials(review.customer?.name || review.user?.name || 'U')}
                      </div>
                      <div>
                        <span className="review-author">{review.customer?.name || review.user?.name || 'Anonymous'}</span>
                        <span className="review-date">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBooking && (
        <BookingModal
          provider={provider}
          onClose={() => setShowBooking(false)}
          onBooked={() => fetchData()}
        />
      )}
    </div>
  );
};

export default ProviderProfile;
