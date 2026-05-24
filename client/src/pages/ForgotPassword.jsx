import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import './Auth.css';

// ─── STEP 1 — Enter Email or Mobile ──────────────────────────────────────────
const StepContact = ({ onNext }) => {
  const [method, setMethod] = useState('email'); // 'email' or 'mobile'
  const [email, setEmail]   = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (method === 'mobile') {
      toast.error('Mobile OTP coming soon! Please use email for now.');
      return;
    }

    if (!email) { toast.error('Please enter your email'); return; }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success('OTP sent to your email! 📧');
      onNext({ email, userId: res.data.userId, method: 'email' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">Forgot Password 🔑</h2>
      <p className="auth-subtitle">Reset your password via Email or Mobile</p>

      {/* Method Tabs */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${method === 'email' ? 'active' : ''}`}
          onClick={() => setMethod('email')}
        >
          <FiMail /> Email
        </button>
        <button
          type="button"
          className="auth-tab"
          style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}
          onClick={() => toast('Mobile OTP coming soon! 🚀', { icon: '📱' })}
        >
          <FiPhone /> Mobile
          <span style={{
            position: 'absolute', top: '-8px', right: '-4px',
            background: '#ff8800', color: '#000', fontSize: '8px',
            padding: '2px 5px', borderRadius: '6px', fontFamily: 'var(--font-gaming)',
            letterSpacing: '0.5px', fontWeight: 700
          }}>SOON</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {method === 'email' ? (
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <FiMail />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-wrap">
              <FiPhone />
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>
            <div style={{
              background: 'rgba(255,170,0,0.08)',
              border: '1px solid rgba(255,170,0,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginTop: '8px',
              fontSize: '13px',
              color: '#ffaa00'
            }}>
              ⚠️ Mobile OTP coming soon. Please use Email for now.
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending OTP...</>
          ) : (
            <>Send OTP <FiArrowRight /></>
          )}
        </button>
      </form>
    </>
  );
};

// ─── STEP 2 — Enter OTP ───────────────────────────────────────────────────────
const StepOTP = ({ data, onNext, onBack }) => {
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]    = useState(false);
  const [timer, setTimer]        = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (i, val) => {
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (!data.userId) { toast.error('Session expired. Start again.'); onBack(); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyForgotOTP({ userId: data.userId, otp: code });
      toast.success('OTP verified! ✅');
      onNext({ userId: data.userId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.forgotPassword({ email: data.email });
      toast.success('New OTP sent!');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend');
    }
  };

  return (
    <>
      <h2 className="auth-title">Enter OTP 🔢</h2>
      <p className="auth-subtitle">
        OTP sent to<br />
        <strong style={{ color: 'var(--primary)' }}>
          {data.email || data.mobile}
        </strong>
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleVerify(otp.join('')); }} className="auth-form">
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`otp-input ${digit ? 'filled' : ''}`}
            />
          ))}
        </div>

        <div className="otp-timer">
          {canResend ? (
            <button type="button" onClick={handleResend}
              style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600 }}>
              🔄 Resend OTP
            </button>
          ) : (
            <>Resend OTP in <span>{timer}s</span></>
          )}
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading
            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Verifying...</>
            : <>Verify OTP <FiArrowRight /></>
          }
        </button>
      </form>

      <p className="auth-switch">
        <button onClick={onBack}><FiArrowLeft /> Go back</button>
      </p>
    </>
  );
};

// ─── STEP 3 — New Password ────────────────────────────────────────────────────
const StepNewPassword = ({ data, onDone }) => {
  const [form, setForm]          = useState({ password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword({ userId: data.userId, newPassword: form.password });
      toast.success('Password reset successfully! 🎉');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">New Password 🔒</h2>
      <p className="auth-subtitle">Set a strong new password for your account</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>New Password</label>
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
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="input-wrap">
            <FiLock />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              autoComplete="new-password"
              required
            />
          </div>
          {form.confirm && form.password !== form.confirm && (
            <span style={{ color: 'var(--sold)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              ❌ Passwords don't match
            </span>
          )}
          {form.confirm && form.password === form.confirm && form.confirm.length >= 6 && (
            <span style={{ color: 'var(--success)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              ✅ Passwords match
            </span>
          )}
        </div>

        <button type="submit" className="btn-primary auth-submit" disabled={loading}>
          {loading
            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Resetting...</>
            : <>Reset Password <FiArrowRight /></>
          }
        </button>
      </form>
    </>
  );
};

// ─── STEP 4 — Success ─────────────────────────────────────────────────────────
const StepSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="auth-success">
      <span className="success-icon">🎉</span>
      <h2 className="auth-title">Password Reset!</h2>
      <p className="auth-subtitle">
        Your password has been updated successfully.<br />
        Redirecting to login...
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
          Login Now <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});

  const goNext = (newData) => {
    setData(prev => ({ ...prev, ...newData }));
    setStep(prev => prev + 1);
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-x">X</span>TREAME STORE
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="auth-steps">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`step-dot ${s < step ? 'done' : s === step ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Steps */}
        {step === 1 && <StepContact onNext={goNext} />}
        {step === 2 && <StepOTP data={data} onNext={goNext} onBack={() => setStep(1)} />}
        {step === 3 && <StepNewPassword data={data} onDone={() => setStep(4)} />}
        {step === 4 && <StepSuccess />}

        {/* Back to login */}
        {step === 1 && (
          <p className="auth-switch">
            Remember password? <Link to="/login">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
