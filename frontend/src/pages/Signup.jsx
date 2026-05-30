import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, UserPlus, ArrowRight, User, Phone,
  MapPin, FileText, IndianRupee, Briefcase, Tag, Award
} from 'lucide-react';
import './Auth.css';

const CATEGORIES = [
  'Home Repairs', 'Cleaning', 'Tutoring', 'IT Support',
  'Wellness', 'Beauty', 'Moving', 'Other'
];

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    bio: '',
    category: 'Home Repairs',
    skills: '',
    hourlyRate: '',
    location: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        role,
      };
      if (role === 'provider') {
        data.bio = form.bio;
        data.category = form.category;
        data.skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
        data.hourlyRate = Number(form.hourlyRate);
        data.location = form.location;
        data.experience = Number(form.experience);
      }
      await signup(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="auth-shape shape-1" />
        <div className="auth-shape shape-2" />
      </div>

      <div className="auth-card signup-card glass-card-static">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join ServiceHub today</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
          >
            <User size={16} />
            Customer
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'provider' ? 'active' : ''}`}
            onClick={() => setRole('provider')}
          >
            <Briefcase size={16} />
            Service Provider
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="input-group">
              <label>Phone</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Address</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                name="address"
                className="input-field"
                placeholder="Your address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {role === 'provider' && (
            <div className="provider-fields">
              <div className="provider-fields-divider">
                <span>Provider Details</span>
              </div>

              <div className="input-group">
                <label>Bio</label>
                <div className="input-with-icon">
                  <FileText size={18} className="input-icon" style={{ top: '20px', transform: 'none' }} />
                  <textarea
                    name="bio"
                    className="input-field"
                    placeholder="Tell clients about yourself and your expertise..."
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="input-field"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Hourly Rate (₹)</label>
                  <div className="input-with-icon">
                    <IndianRupee size={18} className="input-icon" />
                    <input
                      type="number"
                      name="hourlyRate"
                      className="input-field"
                      placeholder="50"
                      value={form.hourlyRate}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label><Tag size={14} /> Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  className="input-field"
                  placeholder="e.g., Plumbing, Electrical, Painting"
                  value={form.skills}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Service Location</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      name="location"
                      className="input-field"
                      placeholder="City, State"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Experience (years)</label>
                  <div className="input-with-icon">
                    <Award size={18} className="input-icon" />
                    <input
                      type="number"
                      name="experience"
                      className="input-field"
                      placeholder="5"
                      value={form.experience}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <UserPlus size={18} />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
