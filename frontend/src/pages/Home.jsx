import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Sparkles, BookOpen, Monitor, Heart, Scissors,
  Truck, MoreHorizontal, Search, CalendarCheck, ThumbsUp,
  ArrowRight, Users, Star, MapPin, Shield, Zap, Clock
} from 'lucide-react';
import './Home.css';

const categories = [
  { name: 'Home Repairs', icon: Wrench, color: '#f59e0b', slug: 'Home Repairs' },
  { name: 'Cleaning', icon: Sparkles, color: '#06b6d4', slug: 'Cleaning' },
  { name: 'Tutoring', icon: BookOpen, color: '#8b5cf6', slug: 'Tutoring' },
  { name: 'IT Support', icon: Monitor, color: '#10b981', slug: 'IT Support' },
  { name: 'Wellness', icon: Heart, color: '#f43f5e', slug: 'Wellness' },
  { name: 'Beauty', icon: Scissors, color: '#ec4899', slug: 'Beauty' },
  { name: 'Moving', icon: Truck, color: '#3b82f6', slug: 'Moving' },
  { name: 'Other', icon: MoreHorizontal, color: '#6b7280', slug: 'Other' },
];

const steps = [
  { icon: Search, title: 'Search', desc: 'Browse through verified local service professionals in your area.' },
  { icon: CalendarCheck, title: 'Book', desc: 'Choose a time that works for you and book your service online.' },
  { icon: ThumbsUp, title: 'Enjoy', desc: 'Get quality service and leave a review to help the community.' },
];

const AnimatedCounter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Trusted Local Services Platform</span>
          </div>
          <h1 className="hero-title">
            Find Local Service{' '}
            <span className="gradient-text">Professionals</span>
          </h1>
          <p className="hero-subtitle">
            Connect with verified, skilled professionals in your neighborhood.
            From home repairs to personal wellness — book trusted services with confidence.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-primary btn-lg">
              <Search size={20} />
              Explore Services
              <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn btn-outline btn-lg">
              Become a Provider
            </Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <Shield size={16} />
              <span>Verified Providers</span>
            </div>
            <div className="trust-item">
              <Star size={16} />
              <span>Rated & Reviewed</span>
            </div>
            <div className="trust-item">
              <Clock size={16} />
              <span>Instant Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Browse <span className="gradient-text">Categories</span></h2>
            <p>Find the right professional for any service you need</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/search?category=${encodeURIComponent(cat.slug)}`}
                className="category-card glass-card"
                style={{ animationDelay: `${i * 0.08}s`, '--cat-color': cat.color }}
              >
                <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                  <cat.icon size={28} />
                </div>
                <span className="category-name">{cat.name}</span>
                <ArrowRight size={16} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>How It <span className="gradient-text">Works</span></h2>
            <p>Getting started is simple — three easy steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={step.title} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step-number">{i + 1}</div>
                <div className="step-icon-wrapper">
                  <step.icon size={28} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-value"><AnimatedCounter end={500} suffix="+" /></div>
              <div className="stat-label">Service Providers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><CalendarCheck size={24} /></div>
              <div className="stat-value"><AnimatedCounter end={10000} suffix="+" /></div>
              <div className="stat-label">Bookings Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Star size={24} /></div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><MapPin size={24} /></div>
              <div className="stat-value"><AnimatedCounter end={50} suffix="+" /></div>
              <div className="stat-label">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="gradient-text">ServiceHub</h3>
            <p>Your trusted platform for finding local service professionals.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/search">Find Services</Link>
              <Link to="/signup">Become a Provider</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
