import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../../api/authApi';

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60; // seconds

/** Formats seconds as MM:SS */
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email can come from (a) router state set by SignupPage, or (b) query param ?email=...
  const emailFromState = location.state?.email || '';
  const emailFromQuery = new URLSearchParams(location.search).get('email') || '';
  const email = emailFromState || emailFromQuery;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // Timer starts immediately on mount
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef([]);

  // Countdown timer — starts immediately, ticks every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value.slice(-1); // only last character
    setOtp(updated);
    setError('');

    // Auto-advance to next box
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const updated = [...otp];
    pasted.split('').forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) {
      setError('Please enter the full 4-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyEmail({ email, otp: otpValue });
      setSuccess('Email verified! Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
      // Clear OTP boxes on error so user can retry
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    setError('');
    setSuccess('');
    try {
      await resendVerification(email);
      setSuccess('A new OTP has been sent to your email.');
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend. Please try again.');
    }
  }

  if (!email) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.heading}>No email found</h1>
          <p style={styles.subheading}>Please sign up first.</p>
          <Link to="/signup" style={styles.link}>Go to Signup</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>CollabCode</span>
        </div>

        <div style={styles.iconWrap}>📧</div>
        <h1 style={styles.heading}>Check your inbox</h1>
        <p style={styles.subheading}>
          We sent a 4-digit code to<br />
          <strong style={{ color: '#818cf8' }}>{email}</strong>
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                style={{
                  ...styles.otpInput,
                  borderColor: digit ? '#818cf8' : 'rgba(255,255,255,0.15)',
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            id="verify-submit"
            type="submit"
            disabled={loading || otp.join('').length < OTP_LENGTH}
            style={
              loading || otp.join('').length < OTP_LENGTH
                ? { ...styles.btn, ...styles.btnDisabled }
                : styles.btn
            }
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        {/* Resend section: hidden during countdown, visible after */}
        <div style={styles.resendRow}>
          {cooldown > 0 ? (
            <span style={styles.countdownText}>
              Resend available in <strong style={{ color: '#818cf8' }}>{formatCountdown(cooldown)}</strong>
            </span>
          ) : (
            <>
              <span style={styles.resendText}>Didn't receive the code?</span>
              <button
                id="resend-otp"
                onClick={handleResend}
                style={styles.resendBtn}
              >
                Resend OTP
              </button>
            </>
          )}
        </div>

        <p style={styles.footer}>
          Wrong email?{' '}
          <Link to="/signup" style={styles.link}>Sign up again</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '24px', color: '#818cf8', fontWeight: 700, fontFamily: 'monospace' },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  iconWrap: { fontSize: '40px', marginBottom: '12px' },
  heading: { fontSize: '24px', fontWeight: 700, margin: '0 0 8px' },
  subheading: { fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 },
  errorBox: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#fca5a5',
    marginBottom: '16px',
  },
  successBox: {
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#86efac',
    marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  otpRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  otpInput: {
    width: '58px',
    height: '64px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: '#f1f5f9',
    fontSize: '26px',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
    caretColor: '#818cf8',
  },
  btn: {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  resendRow: {
    marginTop: '20px',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '24px',
  },
  countdownText: { fontSize: '13px', color: '#64748b' },
  resendText: { fontSize: '13px', color: '#64748b' },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '16px' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
};
