import { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, IndianRupee } from 'lucide-react';
import { api } from '../api';
import './BookingModal.css';

const BookingModal = ({ provider, onClose, onBooked }) => {
  const [form, setForm] = useState({
    service: provider?.skills?.[0] || '',
    date: '',
    time: '',
    address: '',
    notes: '',
    hours: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const estimatedPrice = (provider?.hourlyRate || 0) * (form.hours || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/bookings', {
        provider: provider._id,
        service: form.service,
        date: form.date,
        time: form.time,
        address: form.address,
        notes: form.notes,
        hours: Number(form.hours),
        totalPrice: estimatedPrice,
      });
      onBooked && onBooked();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Service</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="booking-provider-info">
              <div className="avatar avatar-md">
                {provider?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3>{provider?.name}</h3>
                <p>₹{provider?.hourlyRate}/hr</p>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-grid">
              <div className="input-group">
                <label>Service</label>
                <select
                  name="service"
                  className="input-field"
                  value={form.service}
                  onChange={handleChange}
                  required
                >
                  {provider?.skills?.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Hours</label>
                <input
                  type="number"
                  name="hours"
                  className="input-field"
                  value={form.hours}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  required
                />
              </div>

              <div className="input-group">
                <label><Calendar size={14} /> Date</label>
                <input
                  type="date"
                  name="date"
                  className="input-field"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label><Clock size={14} /> Time</label>
                <input
                  type="time"
                  name="time"
                  className="input-field"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label><MapPin size={14} /> Address</label>
              <input
                type="text"
                name="address"
                className="input-field"
                placeholder="Service location address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label><FileText size={14} /> Notes (Optional)</label>
              <textarea
                name="notes"
                className="input-field"
                placeholder="Any special instructions..."
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="booking-estimate">
              <div className="estimate-row">
                <span>Rate</span>
                <span>₹{provider?.hourlyRate}/hr</span>
              </div>
              <div className="estimate-row">
                <span>Duration</span>
                <span>{form.hours} hour{form.hours > 1 ? 's' : ''}</span>
              </div>
              <div className="estimate-divider" />
              <div className="estimate-row total">
                <span><IndianRupee size={16} /> Estimated Total</span>
                <span>₹{estimatedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
