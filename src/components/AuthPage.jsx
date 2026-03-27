import { useState, useEffect } from 'react';
import appLogo from '../assets/sentinel-logo.svg';

// Floating particle dots for background
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    dur: 6 + Math.random() * 8,
    opacity: Math.random() * 0.25 + 0.05,
  }));

  return (
    <div className="auth-particles" aria-hidden="true">
      {dots.map(d => (
        <div
          key={d.id}
          className="auth-particle"
          style={{
            width: d.size,
            height: d.size,
            left: `${d.x}%`,
            top: `${d.y}%`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Clear errors when switching mode
  useEffect(() => {
    setErrors({});
    setForm({ name: '', email: '', password: '', confirm: '' });
  }, [mode]);

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (mode === 'signup' && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/register' : '/login';
      const res = await fetch(`http://localhost:3001/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setErrors(mode === 'signup' && data.error === 'Email already exists' 
          ? { email: 'Email is already registered' } 
          : { password: data.error || 'Authentication failed' });
        setLoading(false);
        return;
      }

      const user = data.user;
      localStorage.setItem('db-user', JSON.stringify(user));
      localStorage.setItem('db-auth', 'true');
      setLoading(false);
      onAuth(user);
    } catch (err) {
      setErrors({ password: 'Could not connect to server' });
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guest = { name: 'Guest', email: '', avatar: '?', isGuest: true };
    localStorage.setItem('db-auth', 'guest');
    onAuth(guest);
  };

  return (
    <div className="auth-page">
      <Particles />

      {/* Ambient glows */}
      <div className="auth-glow auth-glow-left" />
      <div className="auth-glow auth-glow-right" />

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">
            <img src={appLogo} alt="Sentinel One logo" className="auth-logo-image" />
          </div>
          <div>
            <div className="auth-logo-title">Sentinel One</div>
            <div className="auth-logo-sub">SENTINEL AI</div>
            <p className="auth-logo-tagline">Predict. Protect. Prevent fraud in seconds.</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-trust-row" aria-hidden="true">
            <span className="auth-trust-pill">No spam</span>
            <span className="auth-trust-pill">No ads</span>
            <span className="auth-trust-pill">Private by default</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Welcome text */}
            <div className="auth-welcome">
              <h1 className="auth-title">
                {mode === 'login' ? 'Welcome back' : 'Join Sentinel One'}
              </h1>
              <p className="auth-sub">
                {mode === 'login'
                  ? 'Sign in to access your fraud protection dashboard'
                  : 'Create your free account to protect yourself from cyber fraud'}
              </p>
            </div>

            {/* Name field — signup only */}
            {mode === 'signup' && (
              <div className={`auth-field ${errors.name ? 'error' : ''}`}>
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    className="auth-input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className="auth-error">{errors.name}</span>}
              </div>
            )}

            {/* Email */}
            <div className={`auth-field ${errors.email ? 'error' : ''}`}>
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'error' : ''}`}>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="auth-input"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {/* Confirm Password — signup only */}
            {mode === 'signup' && (
              <div className={`auth-field ${errors.confirm ? 'error' : ''}`}>
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="confirm"
                    className="auth-input"
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={`auth-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Guest */}
            <button type="button" className="auth-guest" onClick={handleGuest}>
              Continue as Guest
            </button>
          </form>

          {/* Footer note */}
          <p className="auth-footnote">
            🔒 All data stays on your device — we never send anything to servers
          </p>
        </div>

        {/* Trust badges */}
        <div className="auth-badges">
          {['🔒 Offline-First', '🇮🇳 Made for India', '⚡ Free Forever'].map((b, i) => (
            <span key={i} className="auth-badge">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
