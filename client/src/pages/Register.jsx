import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './Auth.css';

// Password strength checker
const getStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 6)           score++;
  if (pass.length >= 10)          score++;
  if (/[A-Z]/.test(pass))         score++;
  if (/[0-9]/.test(pass))         score++;
  if (/[^A-Za-z0-9]/.test(pass))  score++;

  if (score <= 1) return { score: 20,  label: 'Weak',        color: '#ff4444' };
  if (score <= 2) return { score: 40,  label: 'Fair',        color: '#ff8800' };
  if (score <= 3) return { score: 65,  label: 'Good',        color: '#ffcc00' };
  if (score <= 4) return { score: 85,  label: 'Strong',      color: '#00cc66' };
  return              { score: 100, label: 'Very Strong', color: '#00ff88' };
};

const Register = () => {
  const [form, setForm]          = useState({ name: '', email: '', mobile: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters'); return;
    }
    if (form.mobile && !/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter valid 10-digit Indian mobile number'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      toast.success(res.data.message);
      navigate('/verify-email', { state: { userId: res.data.userId, email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-x">X</span>TREAME STORE
        </div>

        <h2 className="auth-title">Create Account 🎮</h2>
        <p className="auth-subtitle">Join the #1 Free Fire ID marketplace</p>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrap">
              <FiUser />
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <FiMail />
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label>Mobile Number <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <div className="input-wrap">
              <FiPhone />
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                autoComplete="tel"
                maxLength={10}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <FiLock />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Password Strength */}
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${strength.score}%`, background: strength.color }}
                  />
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating Account...</>
            ) : (
              <>Create Account <FiArrowRight /></>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
