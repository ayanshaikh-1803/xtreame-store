import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './Auth.css';

// ─── Email Login ──────────────────────────────────────────────────────────────
const EmailLogin = ({ from }) => {
  const [form, setForm]        = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error('Email not verified. OTP sent!');
        navigate('/verify-email', { state: { userId: data.userId, email: form.email } });
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Email Address</label>
        <div className="input-wrap">
          <FiMail />
          <input type="email" placeholder="your@email.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email" required />
        </div>
      </div>
      <div className="form-group">
        <label>Password</label>
        <div className="input-wrap">
          <FiLock />
          <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password" required />
          <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
            {showPass ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>
      <div className="forgot-link"><Link to="/forgot-password">Forgot Password?</Link></div>
      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Logging in...</> : <>Login <FiArrowRight /></>}
      </button>
    </form>
  );
};

// ─── Mobile OTP Login ─────────────────────────────────────────────────────────
const MobileLogin = ({ from }) => {
  const [step, setStep]         = useState(1); // 1=enter mobile, 2=enter OTP
  const [mobile, setMobile]     = useState('');
  const [userId, setUserId]     = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(0);
  const inputs = useRef([]);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) { toast.error('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const res = await authAPI.sendMobileOTP({ mobile });
      setUserId(res.data.userId);
      toast.success('OTP sent to your mobile!');
      setStep(2);
      startTimer();
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (val && i === 5 && newOtp.every(d => d)) handleVerify(newOtp.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async (code) => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const res = await authAPI.verifyMobileOTP({ userId, otp: code });
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={handleSendOTP} className="auth-form">
        <div className="form-group">
          <label>Mobile Number</label>
          <div className="input-wrap">
            <FiPhone />
            <span className="phone-prefix">+91</span>
            <input type="tel" placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10} autoComplete="tel" required />
          </div>
        </div>
        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending OTP...</> : <>Send OTP <FiArrowRight /></>}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleVerify(otp.join('')); }} className="auth-form">
      <p className="auth-subtitle" style={{ marginBottom: '16px' }}>
        OTP sent to <strong style={{ color: 'var(--primary)' }}>+91 {mobile}</strong>
      </p>
      <div className="otp-inputs">
        {otp.map((digit, i) => (
          <input key={i} ref={(el) => (inputs.current[i] = el)}
            type="text" inputMode="numeric" maxLength={1} value={digit}
            onChange={(e) => handleOTPChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`otp-input ${digit ? 'filled' : ''}`} />
        ))}
      </div>
      <div className="otp-timer">
        {timer > 0
          ? <>Resend OTP in <span>{timer}s</span></>
          : <button type="button" onClick={() => { setStep(1); setOtp(['','','','','','']); }}
              style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600 }}>
              🔄 Resend OTP
            </button>
        }
      </div>
      <button type="submit" className="btn-primary auth-submit" disabled={loading}>
        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Verifying...</> : <>Verify & Login <FiArrowRight /></>}
      </button>
    </form>
  );
};

// ─── Main Login Page ──────────────────────────────────────────────────────────
const Login = () => {
  const [tab, setTab]   = useState('email'); // 'email' | 'mobile'
  const location        = useLocation();
  const from            = location.state?.from || '/';

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-x">X</span>TREAME STORE
        </div>

        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to your gaming account</p>

        {/* Redirected banner */}
        {location.state?.from && (
          <div style={{
            background: 'rgba(255,0,51,0.08)', border: '1px solid rgba(255,0,51,0.25)',
            borderRadius: '10px', padding: '10px 16px', marginBottom: '16px',
            fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center'
          }}>
            🔐 Please login to continue
          </div>
        )}

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'email' ? 'active' : ''}`} onClick={() => setTab('email')}>
            <FiMail /> Email
          </button>
          <button
            className="auth-tab"
            style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}
            onClick={() => toast('Mobile OTP coming soon! 🚀', { icon: '📱' })}
          >
            <FiPhone /> Mobile OTP
            <span style={{
              position: 'absolute', top: '-8px', right: '-4px',
              background: '#ff8800', color: '#000', fontSize: '8px',
              padding: '2px 5px', borderRadius: '6px', fontFamily: 'var(--font-gaming)',
              letterSpacing: '0.5px', fontWeight: 700
            }}>SOON</span>
          </button>
        </div>

        {tab === 'email'  && <EmailLogin  from={from} />}
        {tab === 'mobile' && <MobileLogin from={from} />}

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up Free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
