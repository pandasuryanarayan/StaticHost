import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useToast } from '../App';

// ─── Auth Modal ────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onSwitch }) {
  const { login, signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {mode === 'login' ? 'Sign in to your StaticHost account' : 'Start hosting for free today'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)',
            borderRadius: '8px', padding: '12px', marginBottom: '20px',
            color: 'var(--accent-red)', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="animate-spin" style={{ display: 'inline-block' }}>⏳</span> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              mode === 'login' ? '🔑 Sign In' : '🚀 Create Account'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={onSwitch}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: '600' }}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Particle ─────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card" style={{ padding: '28px', transition: 'all 0.3s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [authModal, setAuthModal] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #7c3aed, #00d9ff)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px'
          }}>⚡</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>StaticHost</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
          <button className="btn btn-ghost" onClick={() => navigate('/pricing')}>Pricing</button>
          <button className="btn btn-ghost">Docs</button>
          <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => setAuthModal('login')}>Log In</button>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => setAuthModal('signup')}>Sign Up Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg" style={{ position: 'relative', padding: '120px 48px', textAlign: 'center', overflow: 'hidden' }}>
        <Particles />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '100px', padding: '6px 16px',
            marginBottom: '28px', fontSize: '13px', fontWeight: '600', color: '#a78bfa'
          }}>
            🚀 New: Instant global CDN deployment
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
            Deploy Static Sites
            <br />
            <span className="gradient-text">In Seconds.</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            The fastest way to host your static websites. Drag, drop, and go live instantly with our global edge network.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '12px' }}
              onClick={() => setAuthModal('signup')}
            >
              🚀 Start Deploying Free
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '12px' }}
              onClick={() => setAuthModal('login')}
            >
              👀 View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 48px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { value: '50K+', label: 'Sites Hosted' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '200+', label: 'Edge Locations' },
            { value: '<100ms', label: 'Average Deploy Time' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '40px', fontWeight: '900', marginBottom: '8px' }} className="gradient-text">{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '44px', fontWeight: '800', marginBottom: '16px' }}>Deploy in 3 simple steps</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>No complex configuration. No DevOps required.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', icon: '📁', title: 'Upload Your Files', desc: 'Drag & drop your static files (HTML, CSS, JS, images) or select from your computer.' },
            { step: '02', icon: '⚙️', title: 'Configure & Deploy', desc: 'Set your site name and let StaticHost automatically deploy to our global edge network.' },
            { step: '03', icon: '🌍', title: 'Go Live Instantly', desc: 'Your site is live in seconds with a unique URL, HTTPS, and global CDN included free.' },
          ].map(item => (
            <div key={item.step} className="card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-purple)', marginBottom: '16px', letterSpacing: '2px' }}>STEP {item.step}</div>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 48px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '44px', fontWeight: '800', marginBottom: '16px' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>Powerful features built for modern web development</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <FeatureCard icon="⚡" title="Instant Deployments" desc="Deploy your site in under 100ms. Our global edge network ensures lightning-fast delivery worldwide." />
            <FeatureCard icon="🔒" title="Automatic HTTPS" desc="Free SSL certificates for all your sites. Security is built-in by default, no configuration needed." />
            <FeatureCard icon="🌍" title="Global CDN" desc="200+ edge locations worldwide ensure your users experience the fastest possible load times." />
            <FeatureCard icon="📊" title="Real-time Analytics" desc="Track visits, bandwidth, and performance metrics in real-time with our beautiful analytics dashboard." />
            <FeatureCard icon="🔄" title="Instant Rollbacks" desc="Every deployment is stored. Roll back to any previous version with a single click." />
            <FeatureCard icon="🎯" title="Custom Domains" desc="Point your own domain to your StaticHost site with automatic DNS configuration." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 48px', textAlign: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>Ready to deploy?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '40px' }}>
            Join thousands of developers who trust StaticHost. Free forever for personal projects.
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: '18px 48px', fontSize: '18px', borderRadius: '12px' }}
            onClick={() => setAuthModal('signup')}
          >
            🚀 Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>⚡</span>
          <span style={{ fontWeight: '700', color: 'white' }}>StaticHost</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          © 2024 StaticHost. Built with ❤️ for developers.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Docs', 'Status'].map(link => (
            <span key={link} style={{ color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>{link}</span>
          ))}
        </div>
      </footer>

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={() => setAuthModal(authModal === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
}
