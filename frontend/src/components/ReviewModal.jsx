import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import { api } from '../api';
import './ReviewModal.css';

const ReviewModal = ({ booking, onClose, onReviewed }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/reviews', {
        provider: booking.provider?._id || booking.provider,
        booking: booking._id,
        rating,
        comment,
      });
      onReviewed && onReviewed();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Leave a Review</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="review-provider-name">
              How was your experience with <strong>{booking.provider?.name || 'the provider'}</strong>?
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="review-rating-section">
              <label>Your Rating</label>
              <StarRating rating={rating} onRate={setRating} size={32} />
            </div>

            <div className="input-group">
              <label>Your Review</label>
              <textarea
                className="input-field"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
