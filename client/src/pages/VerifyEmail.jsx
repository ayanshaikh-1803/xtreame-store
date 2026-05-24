import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowRight, FiMail } from 'react-icons/fi';
import './Auth.css';

const VerifyEmail = () => {
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading]  = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer]      = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const userId = state?.userId;
  const email  = state?.email;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (!userId) navigate('/register');
    // Auto focus first input
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    // Auto submit when all 6 filled
    if (val && i === 5 && newOtp.every(d => d)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setOtp(arr);
      inputs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyEmail({ userId, otp: code });
      login(res.data.token, res.data.user);
      toast.success(res.data.message);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(otp.join(''));
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success('New OTP sent!');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-x">X</span>TREAME STORE
        </div>

        {/* Steps */}
        <div className="auth-steps">
          <div className="step-dot done" />
          <div className="step-dot active" />
          <div className="step-dot" />
        </div>

        <h2 className="auth-title">Verify Email 📧</h2>
        <p className="auth-subtitle">
          OTP sent to<br />
          <strong style={{ color: 'var(--primary)' }}>{email || 'your email'}</strong>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          {/* Timer */}
          <div className="otp-timer">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{ background: 'none', color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600 }}
              >
                {resending ? 'Sending...' : '🔄 Resend OTP'}
              </button>
            ) : (
              <>Resend OTP in <span>{timer}s</span></>
            )}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Verifying...
              </>
            ) : (
              <>Verify & Continue <FiArrowRight /></>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Wrong email? <button onClick={() => navigate('/register')}>Go back</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
