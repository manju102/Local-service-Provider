import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Key, CheckCircle } from 'lucide-react';
import { api } from '../api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    setResetLink('');
    
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setStatus({ type: 'success', message: res.message });
      // For demonstration purposes without an email service, we'll display the link here
      if (res.resetUrl) {
        setResetLink(res.resetUrl);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to send reset email' });
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

      <div className="auth-card glass-card-static">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {status.message && (
          <div className={status.type === 'error' ? 'error-message' : 'success-message'} style={status.type === 'success' ? { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } : {}}>
            {status.type === 'success' && <CheckCircle size={18} />}
            {status.message}
          </div>
        )}

        {resetLink && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed #6366f1' }}>
            <p style={{ marginBottom: '0.5rem', color: '#a5b4fc', fontSize: '0.9rem' }}>
              <strong>Demo Note:</strong> Since no email service is configured, click the link below to reset your password:
            </p>
            <a href={resetLink} style={{ color: '#818cf8', wordBreak: 'break-all', textDecoration: 'underline' }}>{resetLink}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <Key size={18} />}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
